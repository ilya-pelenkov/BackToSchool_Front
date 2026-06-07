import { isApiError } from '@shared/request-errors'

import { deviceApi } from '../api'
import { cacheManager } from '../cache/cache-manager'
import logger from '../logger'
import { deviceStore } from '../store'
import { contentStore } from '../store/content-store'

const SYNC_RETRY_DELAY_MS = 5 * 60 * 1000
const MAX_SYNC_RETRIES = 3
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 часа

// TODO: убрать мок
const MOCK_SYNC_RESPONSE = {
  terminal_id: 1,
  sync_time: new Date().toISOString(),
  content: [
    {
      id: 1,
      type: 'banner' as const,
      url: 'https://i.pinimg.com/736x/49/76/48/49764810251d8887b7669b38ff43d632.jpg',
      duration: 10,
      schedule: {
        start_time: '07:00:00.000Z',
        end_time: '22:00:00.000Z',
        days_of_week: ['1', '2', '3', '4', '5'],
      },
      target_url: '',
      qr_code_url: '',
    },
    {
      id: 2,
      type: 'video' as const,
      url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4',
      duration: 10,
      schedule: {
        start_time: '07:00:00.000Z',
        end_time: '22:00:00.000Z',
        days_of_week: ['1', '2', '3', '4', '5'],
      },
      target_url: '',
      qr_code_url: '',
    },
  ],
  config: { payload: '' },
}

// однократный запрос
async function sendSync(): Promise<boolean> {
  try {
    const terminalId = deviceStore.get('terminalId')
    if (!terminalId) return false

    const lastSync = contentStore.get('lastSync') ?? new Date(Date.now()).toISOString()
    // TODO: заменить на реальный запрос
    // const res = await deviceApi.sync(String(terminalId), lastSync)
    const res = MOCK_SYNC_RESPONSE

    await cacheManager.sync(res.content)
    contentStore.set('lastSync', res.sync_time)

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
  if (!lastSync) return true
  return Date.now() - new Date(lastSync).getTime() >= SYNC_INTERVAL_MS
}
