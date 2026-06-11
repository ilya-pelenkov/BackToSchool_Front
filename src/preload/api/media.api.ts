import { ipcRenderer } from 'electron'

import { TMediaIpcGetFiles } from '@shared/types'
import { ContentClickPayload, MEDIA_IPC_CHANNELS } from '@shared/types/ipc'

export const mediaApi = {
  getFiles: (): Promise<TMediaIpcGetFiles> => ipcRenderer.invoke('media:getFiles'),
  onUpdated: (callback: () => void) => {
    ipcRenderer.on('media:updated', callback)
    // return для возможности отписки при размонтировании компонента
    return () => {
      ipcRenderer.off('media:updated', callback)
    }
  },
  onFirstSyncStarted: (callback: () => void): void => {
    ipcRenderer.on('media:firstSyncStarted', callback)
  },

  onFirstSyncFinished: (callback: () => void): void => {
    ipcRenderer.on('media:firstSyncFinished', callback)
  },
  requestForceSync: (): Promise<void> => ipcRenderer.invoke('media:requestSync'),
  notifyContentClick: (payload: ContentClickPayload): void =>
    ipcRenderer.send(MEDIA_IPC_CHANNELS.CONTENT_CLICK, payload),
}
