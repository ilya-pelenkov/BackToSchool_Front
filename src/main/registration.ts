import { BrowserWindow } from 'electron'

import { machineIdSync } from 'node-machine-id'

import { isApiError } from '../shared/request-errors'
import { deviceApi } from './api'
import logger from './logger'
import store from './store'

export async function registerDevice(): Promise<void> {
  try {
    store.set('isRegisterLoading', true)
    store.set('isRegistrationError', false)
    const deviceKey = machineIdSync()
    const { auth_token, terminal_id } = await deviceApi.register(deviceKey)
    store.set('authToken', auth_token)
    store.set('terminalId', terminal_id.toString())
    store.set('isRegistered', true)
    logger.info('Device registered', { terminal_id }) // без токена

    // оповещение renderer, что регистрация успешно завершена
    BrowserWindow.getAllWindows()[0]?.webContents.send('registration:done', { success: true })
  } catch (err) {
    store.set('isRegistered', false)

    if (isApiError(err)) {
      store.set('isRegistrationError', true)
      if (err.isUnauthorized) logger.warn('Device not authorized')
      if (err.isServerError) logger.error('Backend error, retry later')
      if (err.isTimeout) logger.warn('Registration timed out')
      if (err.isNetworkError) logger.warn('No network connection')

      // оповещение renderer, что регистрация завершена с ошибкой
      BrowserWindow.getAllWindows()[0]?.webContents.send('registration:done', { success: false })

      return
    }

    logger.error('Unexpected device registration error', { error: (err as Error).message })
    // оповещение renderer, что регистрация завершена с ошибкой
    BrowserWindow.getAllWindows()[0]?.webContents.send('registration:done', { success: false })
  } finally {
    store.set('isRegisterLoading', false)
  }
}
