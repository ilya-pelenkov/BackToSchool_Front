import { net } from 'electron'

import { NETWORK_IPC_CHANNELS } from '@shared/types/ipc'

import logger from '../logger'
import { registerDevice } from '../registration/registration'
import { deviceStore, networkStore, registrationStore } from '../store'
import { sendToRenderer } from '../window'
import { registerErrorHandler } from './error-handlers'

let reregistrationAttempts = 0
const MAX_REREGISTRATION_ATTEMPTS = 3
//для сбрасывания счетчика попыток регистрации после успешной регистрации
export function resetReregistrationAttempts(): void {
  reregistrationAttempts = 0
}

export function setupErrorHandlers(): void {
  // 401
  registerErrorHandler(err => {
    if (!err.isUnauthorized || err.endpoint === '/terminals/register/') return

    if (reregistrationAttempts >= MAX_REREGISTRATION_ATTEMPTS) {
      logger.error('Max reregistration attempts reached')
      sendToRenderer('registration:done', { success: false })
      return
    }

    reregistrationAttempts++
    logger.warn('Unauthorized, attempting reregistration', { attempt: reregistrationAttempts })
    registrationStore.delete('authToken')
    deviceStore.delete('terminalId')
    registrationStore.set('isRegistered', false)
    registerDevice()
  })

  // ошибки сети - запускается таймер проверок статуса сети + отправляются данные на фронтовую часть
  registerErrorHandler(err => {
    if (err.isNetworkError || err.isTimeout) {
      networkStore.set('isOnline', false)
      sendToRenderer(NETWORK_IPC_CHANNELS.STATUS_CHANGE, { online: false })
      logger.warn('Network unavailable')
      startNetworkPolling()
    }
    return
  })
}

let networkPollingTimer: ReturnType<typeof setTimeout> | null = null

function startNetworkPolling(): void {
  if (networkPollingTimer) return

  const poll = (): void => {
    const online = net.isOnline()

    if (online) {
      networkStore.set('isOnline', true)
      sendToRenderer(NETWORK_IPC_CHANNELS.STATUS_CHANGE, { online: true })
      logger.info('Network restored')
      networkPollingTimer = null
      reregistrationAttempts = 0
      return
    }

    networkPollingTimer = setTimeout(poll, 5000)
  }

  poll()
}
