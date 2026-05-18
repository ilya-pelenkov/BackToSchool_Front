// import { apiClient } from './api-client'

//TODO: заменить на реальный запрос регистрации устройста
interface RegisterResponse {
  token: string
}

export const deviceApi = {
  // register: (deviceId: string | null) => apiClient.post<RegisterResponse>('/device/register', { deviceId }),
  register: (deviceId: string | null) =>
    new Promise<RegisterResponse>(resolve => setTimeout(() => resolve({ token: `${deviceId}` }), 1000)),
}
