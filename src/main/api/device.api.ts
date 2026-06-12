import { Content } from '@shared/types'

import { apiClient } from './api-client'

interface RegisterResponse {
  terminal_id: number
  auth_token: string
  location_id: number
  district_id: number
  status: 'offline' | 'online' | 'maintenance'
}

interface HeartbetResponse {
  terminal_id: number
  status: 'offline' | 'online' | 'maintenance'
  last_heartbeat: string
  uptime_seconds: number
}

interface SyncResponse {
  terminal_id: number
  sync_time: string // '2026-05-27T07:59:24.502Z'
  content: Content[]
  config: {
    payload: string // TODO: видимо временная заглушка, поменять, когда изменится у бэка
  }
}

export const deviceApi = {
  //TODO: поменять регистрацию после коррекции от бэка
  register: (deviceKey: string, onRetry?: (attempt: number, maxAttempts: number) => void) =>
    apiClient.post<RegisterResponse>(
      '/terminals/register/',
      { device_key: deviceKey },
      { retry: 'critical', timeout: 15_000, onRetry }
    ),
  heartbeat: (terminalId: string, uptime: number) =>
    apiClient.post<HeartbetResponse>(`/terminals/${terminalId}/heartbeat/`, { uptime_seconds: uptime }),
  sync: (terminalId: string, lastSync: string) =>
    apiClient.post<SyncResponse>(`/terminals/${terminalId}/sync/`, { last_sync: lastSync }),
}
