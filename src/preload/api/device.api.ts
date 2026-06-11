import { ipcRenderer } from 'electron'

import {
  DEVICE_IPC_CHANNELS,
  RegistrationAttemptPayload,
  RegistrationDonePayload,
  RegistrationStatusPayload,
} from '@shared/types/ipc'

export const deviceApi = {
  //получение информации о isRegistered
  isRegistered: (): Promise<boolean> => ipcRenderer.invoke(DEVICE_IPC_CHANNELS.IS_REGISTERED),

  // получение информации о полном статусе регистрации - isLoading, isRegistered, isError
  getRegistrationStatus: (): Promise<RegistrationStatusPayload> =>
    ipcRenderer.invoke(DEVICE_IPC_CHANNELS.GET_REGISTRATION_STATUS),

  // подписка на завершение регистрации
  onRegistrationDone: (cb: (result: RegistrationDonePayload) => void): void => {
    ipcRenderer.once(DEVICE_IPC_CHANNELS.REGISTRATION_DONE, (_, result) => cb(result))
  },

  // подписка на число попыток регистрации
  onRegistrationAttempt: (cb: (data: RegistrationAttemptPayload) => void): void => {
    ipcRenderer.on(DEVICE_IPC_CHANNELS.REGISTRATION_ATTEMPT, (_, data) => cb(data))
  },
}
