import { app } from 'electron'

import fs from 'fs'
import path from 'path'

import type { CachedContent, Content } from '@shared/types'

import { downloadFile } from '../api/'
import logger from '../logger'
import { contentStore } from '../store/content-store'
import { getFreeSpace } from './get-free-space'

export const CACHE_DIR = path.join(app.getPath('userData'), 'cache')

const DIRS = {
  banner: path.join(CACHE_DIR, 'banners'),
  video: path.join(CACHE_DIR, 'videos'),
} satisfies Record<Content['type'], string>

const TIMEOUT_BY_TYPE = {
  banner: 15_000,
  video: 120_000,
} satisfies Record<Content['type'], number>

//TODO: скорректировать после получения реальных размеров файлов и данных об устройстве
const MIN_FREE_SPACE_BY_TYPE = {
  banner: 25 * 1024 * 1024 * 2, //макс размер одного баннера × 2
  video: 500 * 1024 * 1024 * 2, //макс размер одного видео × 2
} satisfies Record<Content['type'], number>

//запас для работы самого приложения — логи, electron-store, обновления
const MIN_SYSTEM_RESERVE_BYTES = 400 * 1024 * 1024 // 400 МБ

export const cacheManager = {
  //инициализация при первом запуске приложения - создание папок для кэширования
  init(): void {
    Object.values(DIRS).forEach(dir => fs.mkdirSync(dir, { recursive: true }))
    logger.info('CacheManager initialized', { cacheDir: CACHE_DIR })
  },

  //синхронизация контента: удаление более ненужных и скачивание новых файлов
  async sync(content: Content[]): Promise<void> {
    const current = contentStore.get('items')

    const toDownload = content.filter(c => {
      const cached = current[c.id]
      return !cached || cached.remoteUrl !== c.url
    })

    const toDelete = Object.values(current).filter(cached => !content.find(c => c.id === cached.contentId))

    for (const cached of toDelete) {
      this.remove(cached.contentId)
    }

    for (const item of toDownload) {
      await this.download(item)
    }
  },

  //скачивание и кэширование одного файла
  async download(item: Content): Promise<void> {
    /* сначала - проверка свободного места на диске, если не хватает - файл не скачивается */
    const freeSpace = await getFreeSpace()
    const required = MIN_FREE_SPACE_BY_TYPE[item.type] + MIN_SYSTEM_RESERVE_BYTES

    if (freeSpace < required) {
      logger.warn('Skipping download due to low disk space', {
        id: item.id,
        type: item.type,
        freeMB: Math.round(freeSpace / 1024 / 1024),
        requiredMB: Math.round(required / 1024 / 1024),
      })
      return
    }

    const basePath = path.join(DIRS[item.type], `${item.id}`)

    logger.info('Downloading content', { id: item.id, type: item.type })

    try {
      const { checksum, finalPath } = await downloadFile(item.url, basePath, {
        timeout: TIMEOUT_BY_TYPE[item.type],
      })

      const cached: CachedContent = {
        contentId: item.id,
        type: item.type,
        localPath: finalPath,
        remoteUrl: item.url,
        checksum,
        downloadedAt: new Date().toISOString(),
        duration: item.duration,
        schedule: item.schedule,
        qr_code_base64: item.qr_code_base64 || undefined,
      }

      const items = contentStore.get('items')
      contentStore.set('items', { ...items, [item.id]: cached })

      logger.info('Content cached', { id: item.id, path: finalPath })
    } catch (err) {
      logger.error('Failed to cache content', { id: item.id, error: (err as Error).message })
    }
  },

  //удаление файла из директории и из стора
  remove(contentId: number): void {
    const items = contentStore.get('items')
    const cached = items[contentId]

    if (!cached) return

    if (fs.existsSync(cached.localPath)) {
      fs.unlinkSync(cached.localPath)
      logger.info('Deleted cached file', { id: contentId, path: cached.localPath })
    }

    const { [contentId]: _, ...rest } = items
    contentStore.set('items', rest)
  },

  //возвращает массив данных о кэшированных файлах (используется в передаче через ipc для renderer)
  getAll(): CachedContent[] {
    return Object.values(contentStore.get('items')).filter(item => fs.existsSync(item.localPath))
  },
}
