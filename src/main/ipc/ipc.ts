import { ipcMain } from 'electron'

import { isApiError } from '@shared/request-errors'
import {
  ContentClickPayload,
  DEVICE_IPC_CHANNELS,
  LOG_IPC_CHANNELS,
  MEDIA_IPC_CHANNELS,
  NETWORK_IPC_CHANNELS,
  NetworkStatusPayload,
  RegistrationStatusPayload,
  RendererLogPayload,
  TMediaIpcGetFiles,
} from '@shared/types/ipc'

import { contentAPI } from '../api/content.api'
import { cacheManager } from '../cache'
import logger from '../logger'
import { runSync } from '../scheduler'
import { deviceStore, networkStore, registrationStore } from '../store'

const MAX_FORCE_SYNC_ATTEMPTS = 2
const FORCE_SYNC_RESET_MS = 1 * 60 * 60 * 1000 // сброс счетчика попыток force sync раз в час
let forceSyncAttempts = 0 // счетчик попыток force sync - для избежания бесконечного цикла
let forceSyncResetTimer: NodeJS.Timeout | null = null // таймер для отсчета FORCE_SYNC_RESET

export function registerIpcHandlers(): void {
  //Состояние isRegistered
  ipcMain.handle(DEVICE_IPC_CHANNELS.IS_REGISTERED, (): boolean => {
    return registrationStore.get('isRegistered')
  })

  //Полное состояние регистрации
  ipcMain.handle(
    DEVICE_IPC_CHANNELS.GET_REGISTRATION_STATUS,
    (): RegistrationStatusPayload => ({
      isLoading: registrationStore.get('isRegisterLoading') ?? false,
      isRegistered: registrationStore.get('isRegistered') ?? false,
      isError: registrationStore.get('isRegistrationError') ?? false,
    })
  )

  //Cостояние сети (онлайн/оффлайн)
  ipcMain.handle(
    NETWORK_IPC_CHANNELS.GET_STATUS,
    (): NetworkStatusPayload => ({
      online: networkStore.get('isOnline'),
    })
  )

  //Получение медиа файлов для отображения
  ipcMain.handle(MEDIA_IPC_CHANNELS.GET_FILES, (): TMediaIpcGetFiles => {
    // TODO: добавить фильтрацию по start_time/end_time когда появится требование
    return cacheManager.getAll().map(item => ({
      contentId: item.contentId,
      path: `media://${item.contentId}`,
      type: item.type,
      duration: item.duration,
      qr_code_base64: item.qr_code_base64,
    }))
  })

  //удаление кэша и новый sync запрос при ошибках воспроизведения всех файлов
  ipcMain.handle(MEDIA_IPC_CHANNELS.REQUEST_FORCE_SYNC, async () => {
    if (forceSyncAttempts >= MAX_FORCE_SYNC_ATTEMPTS) {
      logger.warn('Force sync rejected: max attempts reached', { attempts: forceSyncAttempts })
      return
    }
    forceSyncAttempts += 1
    logger.warn('Force sync requested: all files failed to play, clearing cache', {
      attempt: forceSyncAttempts,
      max_attempts: MAX_FORCE_SYNC_ATTEMPTS,
    })

    if (!forceSyncResetTimer) {
      forceSyncResetTimer = setTimeout(() => {
        forceSyncAttempts = 0
        forceSyncResetTimer = null
        logger.info('Force sync attempts counter reset')
      }, FORCE_SYNC_RESET_MS)
    }

    cacheManager.clearCache()
    await runSync()
  })

  //обработка клика по контенту - отправка POST запроса
  ipcMain.on(MEDIA_IPC_CHANNELS.CONTENT_CLICK, async (_event, payload: ContentClickPayload) => {
    logger.info('received click ipc from renderer')
    const deviceId = deviceStore.get('terminalId')
    if (!deviceId) return
    try {
      await contentAPI.click(deviceId, payload.contentId)
      logger.info(`POST /click success, content_id: ${payload.contentId}`)
    } catch (err) {
      if (isApiError(err)) {
        logger.error('POST /click failure', { code: err.code, status: err.status, message: err.message })
        return
      }
      logger.error('Unexpected POST /click failure', { error: (err as Error).message })
    }
  })

  //логирование ошибок, пойманных в renderer
  ipcMain.on(LOG_IPC_CHANNELS.WRITE, (_event, payload: RendererLogPayload) => {
    logger[payload.level](`[renderer] ${payload.message}`, payload.meta)
  })
}
