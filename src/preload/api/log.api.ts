import { ipcRenderer } from 'electron'

import { LOG_IPC_CHANNELS, RendererLogPayload } from '@shared/types/ipc'

export const logApi = {
  error: (payload: RendererLogPayload): void => {
    ipcRenderer.send(LOG_IPC_CHANNELS.WRITE, payload)
  },
}
