import { BrowserWindow } from 'electron'

import { machineIdSync } from 'node-machine-id'

import { isApiError } from '../shared/request-errors'
import { deviceApi } from './api'
import { resetReregistrationAttempts } from './api/setup-error-handlers'
import logger from './logger'
import { registrationStore } from './store'

export async function registerDevice(): Promise<void> {
  try {
    registrationStore.set('isRegisterLoading', true)
    registrationStore.set('isRegistrationError', false)
    const deviceKey = machineIdSync()
    const { auth_token, terminal_id } = await deviceApi.register(deviceKey, (attempt, maxAttempts) => {
      BrowserWindow.getAllWindows()[0]?.webContents.send('registration:attempt', {
        attempt,
        maxAttempts,
      })
    })
    registrationStore.set('authToken', auth_token)
    registrationStore.set('terminalId', terminal_id.toString())
    registrationStore.set('isRegistered', true)
    resetReregistrationAttempts()
    logger.info('Device registered', { terminal_id })
  } catch (err) {
    registrationStore.set('isRegistered', false)
    registrationStore.set('isRegistrationError', true)

    if (isApiError(err)) {
      if (err.isUnauthorized) logger.warn('Device not authorized')
      if (err.isServerError) logger.error('Backend error, retry later')
      if (err.isTimeout) logger.warn('Registration timed out')
      if (err.isNetworkError) logger.warn('No network connection')

      return
    }

    logger.error('Unexpected device registration error', { error: (err as Error).message })
  } finally {
    registrationStore.set('isRegisterLoading', false)
    BrowserWindow.getAllWindows()[0]?.webContents.send('registration:done', {
      success: registrationStore.get('isRegistered'),
    })
  }
}
