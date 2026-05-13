import { ipcRenderer } from 'electron'

export const deviceApi = {
  isRegistered: (): Promise<boolean> => ipcRenderer.invoke('device:isRegistered'),
}
