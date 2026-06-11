import { ipcRenderer } from 'electron'

import { NETWORK_IPC_CHANNELS, NetworkStatusPayload } from '@shared/types/ipc'

export const networkApi = {
  //однократное получение статуса сети
  getStatus: (): Promise<NetworkStatusPayload> => ipcRenderer.invoke(NETWORK_IPC_CHANNELS.GET_STATUS),

  //подписка на изменение статуса сети
  onStatusChange: (cb: (status: NetworkStatusPayload) => void): void => {
    ipcRenderer.on(NETWORK_IPC_CHANNELS.STATUS_CHANGE, (_, status) => cb(status))
  },
}
