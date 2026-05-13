import { apiClient } from './api-client'

//TODO: заменить на реальный запрос регистрации устройста
interface RegisterResponse {
  deviceId: string
}

export const deviceApi = {
  register: (deviceId: string | null) => apiClient.post<RegisterResponse>('/device/register', { deviceId }),
}
