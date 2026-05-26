import { ipcRenderer } from 'electron'

export interface NetworkStatus {
  online: boolean
}

export const networkApi = {
  //однократное получение
  getStatus: (): Promise<NetworkStatus> => ipcRenderer.invoke('network:getStatus'),

  //подписка на изменение
  onStatusChange: (cb: (status: NetworkStatus) => void): void => {
    ipcRenderer.on('network:status', (_, status) => cb(status))
  },
}
