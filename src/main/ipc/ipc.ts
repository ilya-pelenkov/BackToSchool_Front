import { app, ipcMain } from 'electron'

import { readdirSync } from 'fs'
import { join } from 'path'

import { TMediaIpcGetFiles } from '@shared/types'

import { networkStore, registrationStore } from '../store'

const CACHED_DIR = join(app.getPath('userData'), 'cached')

const SUPPORTED_EXTENSIONS = ['.mp4', '.jpg', '.jpeg', '.png', '.webp'] //TODO: продумать поддерживаемые файлы

export function registerIpcHandlers(): void {
  //Состояние регистрации
  ipcMain.handle('device:isRegistered', (): boolean => {
    return registrationStore.get('isRegistered')
  })
  ipcMain.handle('device:getRegistrationStatus', () => ({
    isLoading: registrationStore.get('isRegisterLoading') ?? false,
    isRegistered: registrationStore.get('isRegistered') ?? false,
    isError: registrationStore.get('isRegistrationError') ?? false,
  }))

  //Получение медиа файлов для отображения
  ipcMain.handle('media:getFiles', (): TMediaIpcGetFiles => {
    const files = readdirSync(CACHED_DIR)
      .filter(f => SUPPORTED_EXTENSIONS.some(ext => f.toLowerCase().endsWith(ext)))
      .map(f => ({
        name: f,
        path: `media://${join(CACHED_DIR, f)}`,
        type: f.match(/\.(mp4|mov)$/i) ? 'video' : ('image' as 'video' | 'image'),
      }))
    return files
  })

  //Cостояние сети (онлайн/оффлайн)
  ipcMain.handle('network:getStatus', () => ({
    online: networkStore.get('isOnline') ?? true,
  }))
}
