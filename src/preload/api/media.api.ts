import { ipcRenderer } from 'electron'

import { TMediaIpcGetFiles } from '@shared/types'

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
}
