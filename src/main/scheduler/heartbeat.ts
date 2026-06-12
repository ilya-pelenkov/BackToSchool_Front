import { isApiError } from '@shared/request-errors'

import { deviceApi } from '../api'
import logger from '../logger'
import { deviceStore } from '../store'

const HEARTBEAT_RETRY_DELAY_MS = 5 * 60 * 1000
const MAX_HEARTBEAT_RETRIES = 1
const HEARTBEAT_INTERVAL_MS = 58 * 60 * 1000

// однократный запрос
async function sendHeartbeat(): Promise<boolean> {
  try {
    const terminalId = deviceStore.get('terminalId')
    if (!terminalId) return false

    const uptime = Math.floor(process.uptime())
    const res = await deviceApi.heartbeat(terminalId, uptime)
    deviceStore.set('lastHeartbeatAt', new Date(res.last_heartbeat).getTime())
    return true
  } catch (err) {
    if (isApiError(err)) {
      logger.warn('Heartbeat failed', { code: err.code, status: err.status })
      return false
    }
    logger.error('Unexpected heartbeat error', { error: (err as Error).message })
    return false
  }
}

// повторная попытка sendHeartbeat при неуспешном запросе
export async function runHeartbeat(retryCount = 0): Promise<void> {
  const success = await sendHeartbeat()

  if (success) logger.info('POST /heartbeat success')

  if (!success && retryCount < MAX_HEARTBEAT_RETRIES) {
    logger.warn(`Heartbeat failed, retrying in ${HEARTBEAT_RETRY_DELAY_MS / 60_000} minutes`, {
      retryCount: retryCount + 1,
    })
    setTimeout(() => runHeartbeat(retryCount + 1), HEARTBEAT_RETRY_DELAY_MS)
    return
  }

  if (!success) {
    logger.warn('Heartbeat failed after all retries, next attempt on schedule')
  }
}

// проверка, нужна ли внеочередная отправка heartbeat (если было выключение киоска)
export function shouldSendHeartbeatOnStart(): boolean {
  const lastHeartbeatAt = deviceStore.get('lastHeartbeatAt')
  if (!lastHeartbeatAt) return true
  return Date.now() - lastHeartbeatAt >= HEARTBEAT_INTERVAL_MS
}
