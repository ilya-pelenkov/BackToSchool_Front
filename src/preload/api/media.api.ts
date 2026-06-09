import { ipcRenderer } from 'electron'

import { TMediaIpcGetFiles } from '@shared/types'

export const mediaApi = {
  getFiles: (): Promise<TMediaIpcGetFiles> => ipcRenderer.invoke('media:getFiles'),
  onUpdated: (callback: () => void) => {
    ipcRenderer.on('media:updated', callback)
    return () => ipcRenderer.off('media:updated', callback)
  },
}
