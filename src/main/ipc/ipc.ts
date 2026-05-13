// src/main/ipc.ts
import { ipcMain } from 'electron'

import store from '../store'

export function registerIpcHandlers(): void {
  ipcMain.handle('device:isRegistered', (): boolean => {
    return store.get('isRegistered')
  })
}
