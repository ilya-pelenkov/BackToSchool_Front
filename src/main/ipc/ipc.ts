import { ipcMain } from 'electron'

import { TMediaIpcGetFiles } from '@shared/types'

import { cacheManager } from '../cache'
import { networkStore, registrationStore } from '../store'

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
    // TODO: добавить фильтрацию по start_time/end_time когда появится требование
    return cacheManager.getAll().map(item => ({
      contentId: item.contentId,
      path: `media://${item.localPath}`,
      type: item.type,
      duration: item.duration,
      qr_code_base64: item.qr_code_base64,
    }))
  })

  //Cостояние сети (онлайн/оффлайн)
  ipcMain.handle('network:getStatus', () => ({
    online: networkStore.get('isOnline'),
  }))
}
