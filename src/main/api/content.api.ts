import { apiClient } from './api-client'

type ClickResponse = {
  status: string
}

export const contentAPI = {
  click: (terminalId: string, contentId: number) =>
    apiClient.post<ClickResponse>(`/terminals/${terminalId}/heartbeat/`, { content_id: contentId }),
}
