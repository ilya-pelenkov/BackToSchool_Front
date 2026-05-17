import { ipcMain } from 'electron'

import { readdirSync } from 'fs'
import { join } from 'path'

import { TMediaIpcGetFiles } from '@shared/types'

import store from '../store'

const CACHED_DIR = '/Users/d.akhmadullina/dev_cache_media' //TODO: изменить на относительный путь, продумать путь для windows

const SUPPORTED_EXTENSIONS = ['.mp4', '.jpg', '.jpeg', '.png', '.webp'] //TODO: продумать поддерживаемые файлы

export function registerIpcHandlers(): void {
  ipcMain.handle('device:isRegistered', (): boolean => {
    return store.get('isRegistered')
  })
  ipcMain.handle('media:getFiles', (): TMediaIpcGetFiles => {
    const files = readdirSync(CACHED_DIR)
      .filter(f => SUPPORTED_EXTENSIONS.some(ext => f.toLowerCase().endsWith(ext)))
      .map(f => ({
        name: f,
        path: `media:///${join(CACHED_DIR, f)}`,
        type: f.match(/\.(mp4|mov)$/i) ? 'video' : ('image' as 'video' | 'image'),
      }))
    return files
  })
}
