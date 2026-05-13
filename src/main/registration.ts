// src/main/registration.ts
import { isApiError } from '../shared/request-errors'
import { deviceApi } from './api'
import logger from './logger'
import store from './store'

//TODO: заменить store.set на реальную логику
export async function registerDevice(): Promise<void> {
  try {
    const { deviceId } = await deviceApi.register(store.get('deviceId'))
    store.set('deviceId', deviceId)
    store.set('isRegistered', true)
    logger.info('Device registered', { deviceId })
  } catch (err) {
    store.set('isRegistered', false)

    if (isApiError(err)) {
      if (err.isUnauthorized) logger.warn('Device not authorized')
      if (err.isServerError) logger.error('Backend error, retry later')
      if (err.isTimeout) logger.warn('Registration timed out')
      if (err.isNetworkError) logger.warn('No network connection')
      return
    }

    logger.error('Unexpected error', { error: (err as Error).message })
  }
}
