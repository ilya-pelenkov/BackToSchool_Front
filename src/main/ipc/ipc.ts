import { ipcMain } from 'electron'

import { isApiError } from '@shared/request-errors'
import { TMediaIpcGetFiles } from '@shared/types'
import { ContentClickPayload, MEDIA_IPC_CHANNELS } from '@shared/types/ipc'

import { contentAPI } from '../api/content.api'
import { cacheManager } from '../cache'
import logger from '../logger'
import { runSync } from '../scheduler'
import { deviceStore, networkStore, registrationStore } from '../store'

export function registerIpcHandlers(): void {
  //Состояние регистрации
  ipcMain.handle('device:isRegistered', (): boolean => {
    return registrationStore.get('isRegistered')
  })
  ipcMain.handle('device:getRegistrationStatus', () => ({
    isLoading: registrationStore.get('isRegisterLoading') ?? false,
    isRegistered: registrationStore.get('isRegistered') ?? false,
    isError: registrationStore.get('isRegistrationError') ?? false,
  }))

  //Получение медиа файлов для отображения
  ipcMain.handle('media:getFiles', (): TMediaIpcGetFiles => {
    // TODO: добавить фильтрацию по start_time/end_time когда появится требование
    return cacheManager.getAll().map(item => ({
      contentId: item.contentId,
      path: `media://${item.localPath}`,
      type: item.type,
      duration: item.duration,
      qr_code_base64: item.qr_code_base64,
    }))
  })

  //Cостояние сети (онлайн/оффлайн)
  ipcMain.handle('network:getStatus', () => ({
    online: networkStore.get('isOnline'),
  }))

  //удаление кэша и новый sync запрос при ошибках воспроизведения всех файлов
  ipcMain.handle('media:requestForceSync', async () => {
    logger.warn('Force sync requested: all files failed to play, clearing cache')
    cacheManager.clearCache()
    await runSync()
  })

  //обработка клика по контенту - отправка POST запроса
  ipcMain.on(MEDIA_IPC_CHANNELS.CONTENT_CLICK, async (_event, payload: ContentClickPayload) => {
    const deviceId = deviceStore.get('terminalId')
    if (!deviceId) return
    try {
      await contentAPI.click(deviceId, payload.contentId)
      logger.info('POST /click success', payload.contentId)
    } catch (err) {
      if (isApiError(err)) {
        logger.error('POST /click failure', { code: err.code, status: err.status, message: err.message })
        return
      }
      logger.error('Unexpected POST /click failure', { error: (err as Error).message })
    }
  })
}
