import { machineIdSync } from 'node-machine-id'

import { isApiError } from '../shared/request-errors'
import { deviceApi } from './api'
import { resetReregistrationAttempts } from './api/setup-error-handlers'
import logger from './logger'
import { deviceStore, registrationStore } from './store'
import { sendToRenderer } from './window'

export async function registerDevice(): Promise<void> {
  try {
    registrationStore.set('isRegisterLoading', true)
    registrationStore.set('isRegistrationError', false)
    const deviceKey = machineIdSync()
    const { auth_token, terminal_id } = await deviceApi.register(deviceKey, (attempt, maxAttempts) => {
      sendToRenderer('registration:attempt', {
        attempt,
        maxAttempts,
      })
    })
    registrationStore.set('authToken', auth_token)
    deviceStore.set('terminalId', terminal_id.toString())
    registrationStore.set('isRegistered', true)
    resetReregistrationAttempts()
    logger.info('Device registered', { terminal_id })
  } catch (err) {
    registrationStore.set('isRegistered', false)
    registrationStore.set('isRegistrationError', true)

    if (isApiError(err)) {
      logger.warn('Registration failed', { code: err.code, status: err.status })
      return
    }

    logger.error('Unexpected device registration error', { error: (err as Error).message })
  } finally {
    registrationStore.set('isRegisterLoading', false)
    sendToRenderer('registration:done', {
      success: registrationStore.get('isRegistered'),
    })
  }
}
