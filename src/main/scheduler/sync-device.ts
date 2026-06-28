import { isApiError } from '@shared/request-errors'
import { MEDIA_IPC_CHANNELS } from '@shared/types/ipc'

import { deviceApi } from '../api'
import { cacheManager } from '../cache/cache-manager'
import logger from '../logger'
import { deviceStore } from '../store'
import { contentStore } from '../store/content-store'
import { sendToRenderer } from '../window'

const SYNC_RETRY_DELAY_MS = 5 * 60 * 1000
const MAX_SYNC_RETRIES = 3
const SYNC_INTERVAL_MS = 22 * 60 * 60 * 1000 // 22 часа
const EMPTY_CONTENT_RETRY_MS = 2 * 60 * 60 * 1000 // 2 часа

// однократный запрос
async function sendSync(): Promise<boolean> {
  try {
    const terminalId = deviceStore.get('terminalId')
    if (!terminalId) return false
    // проверка, есть ли уже ранее загруженный контент (для передачи состояния в renderer)
    const isFirstSync = cacheManager.getAll().length === 0
    if (isFirstSync) sendToRenderer(MEDIA_IPC_CHANNELS.FIRST_SYNC_STARTED)

    const lastSync = contentStore.get('lastSync') || new Date(Date.now()).toISOString()
    const res = await deviceApi.sync(String(terminalId), lastSync)

    await cacheManager.sync(res.content)
    contentStore.set('lastSync', res.sync_time)

    if (res.content.length === 0) {
      logger.warn(`Sync returned empty content, will retry in ${EMPTY_CONTENT_RETRY_MS / (60 * 60 * 1000)} hours`)
      setTimeout(() => runSync(), EMPTY_CONTENT_RETRY_MS)
    }

    sendToRenderer(MEDIA_IPC_CHANNELS.UPDATED)
    logger.info('POST /sync success')
    if (isFirstSync) sendToRenderer(MEDIA_IPC_CHANNELS.FIRST_SYNC_FINISHED)
    return true
  } catch (err) {
    if (isApiError(err)) {
      logger.warn('Sync failed', { code: err.code, status: err.status })
      return false
    }
    logger.error('Unexpected sync error', { error: (err as Error).message })
    return false
  }
}

// повторная попытка при неуспешном запросе
export async function runSync(retryCount = 0): Promise<void> {
  const success = await sendSync()

  if (!success && retryCount < MAX_SYNC_RETRIES) {
    logger.warn(`Sync failed, retrying in ${SYNC_RETRY_DELAY_MS / 60_000} minutes`, {
      retryCount: retryCount + 1,
    })
    setTimeout(() => runSync(retryCount + 1), SYNC_RETRY_DELAY_MS)
    return
  }

  if (!success) {
    logger.warn('Sync failed after all retries, next attempt in 24 hours')
  }
}

// проверка, нужна ли синхронизация при старте
export function shouldSyncOnStart(): boolean {
  const lastSync = contentStore.get('lastSync')
  const items = contentStore.get('items')

  if (!lastSync || Object.keys(items).length === 0) return true
  return Date.now() - new Date(lastSync).getTime() >= SYNC_INTERVAL_MS
}
