import { apiClient } from './api-client'

interface RegisterResponse {
  terminal_id: number
  auth_token: string
  location_id: number
  district_id: number
  status: 'offline' | 'online' | 'maintenance'
}

export const deviceApi = {
  //TODO: поменять после коррекции от бэка
  register: (deviceKey: string, onRetry?: (attempt: number, maxAttempts: number) => void) =>
    apiClient.post<RegisterResponse>(
      '/terminals/register/',
      { serial_number: deviceKey, secret_key: '57rstRyCkWN2K6Hj2jwASW55lRH1B4nvLX2zrsL8lc4' },
      { retry: 'critical', timeout: 10_000, onRetry }
    ),
}
