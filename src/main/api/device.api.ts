import { apiClient } from './api-client'

interface RegisterResponse {
  terminal_id: number
  auth_token: string
  location_id: number
  district_id: number
  status: 'offline' | 'online'
}

export const deviceApi = {
  register: (deviceKey: string) =>
    apiClient.post<RegisterResponse>('/terminals/register/', { deviceKey }, { retry: 'critical', timeout: 10_000 }),
  // register: (deviceId: string) =>
  //   new Promise<RegisterResponse>(resolve =>
  //     setTimeout(
  //       () =>
  //         resolve({ terminal_id: 123, auth_token: deviceId, location_id: 123, district_id: 123, status: 'offline' }),
  //       1000
  //     )
  //   ),
}
