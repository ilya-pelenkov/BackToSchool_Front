import { ipcRenderer } from 'electron'

export interface RegistrationStatus {
  isLoading: boolean
  isRegistered: boolean
  isError: boolean
}

export const deviceApi = {
  isRegistered: (): Promise<boolean> => ipcRenderer.invoke('device:isRegistered'),

  getRegistrationStatus: (): Promise<RegistrationStatus> => ipcRenderer.invoke('device:getRegistrationStatus'),

  onRegistrationDone: (cb: (result: { success: boolean }) => void): void => {
    ipcRenderer.once('registration:done', (_, result) => cb(result))
  },

  onRegistrationAttempt: (cb: (data: { attempt: number; maxAttempts: number }) => void): void => {
    ipcRenderer.on('registration:attempt', (_, data) => cb(data))
  },
}
