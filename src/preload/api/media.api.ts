import { ipcRenderer } from 'electron'

import { TMediaIpcGetFiles } from '@shared/types'
import { ContentClickPayload, MEDIA_IPC_CHANNELS } from '@shared/types/ipc'

export const mediaApi = {
  //получение всех файлов для воспроизведения
  getFiles: (): Promise<TMediaIpcGetFiles> => ipcRenderer.invoke(MEDIA_IPC_CHANNELS.GET_FILES),

  //подписка на окончание зугрзки контента
  onUpdated: (callback: () => void) => {
    ipcRenderer.on('media:updated', callback)
    // return для возможности отписки при размонтировании компонента
    return () => {
      ipcRenderer.off(MEDIA_IPC_CHANNELS.UPDATED, callback)
    }
  },

  //подписка на начало первой загрузки файлов (при пустом кэше)
  onFirstSyncStarted: (callback: () => void): void => {
    ipcRenderer.on(MEDIA_IPC_CHANNELS.FIRST_SYNC_STARTED, callback)
  },

  //подписка на окончание первой загрузки файлов (при пустом кэше)
  onFirstSyncFinished: (callback: () => void): void => {
    ipcRenderer.on(MEDIA_IPC_CHANNELS.FIRST_SYNC_FINISHED, callback)
  },

  //запрос на удаление кэша и новую загрузку файлов
  requestForceSync: (): Promise<void> => ipcRenderer.invoke(MEDIA_IPC_CHANNELS.REQUEST_FORCE_SYNC),

  //уведомление о клике по контенту
  notifyContentClick: (payload: ContentClickPayload): void =>
    ipcRenderer.send(MEDIA_IPC_CHANNELS.CONTENT_CLICK, payload),
}
