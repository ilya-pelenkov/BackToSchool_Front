import { ipcRenderer } from 'electron'

import { LOG_IPC_CHANNELS, RendererLogLevel } from '@shared/types/ipc'

function send(level: RendererLogLevel, message: string, meta?: Record<string, unknown>): void {
  ipcRenderer.send(LOG_IPC_CHANNELS.WRITE, { level, message, meta, timestamp: Date.now() })
}

export const logApi = {
  info: (message: string, meta?: Record<string, unknown>): void => send('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>): void => send('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>): void => send('error', message, meta),
}
