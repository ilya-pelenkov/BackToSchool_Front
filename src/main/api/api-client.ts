// src/main/api/client.ts
import logger from '../logger'
import { ApiError } from './errors'

const BASE_URL = import.meta.env.MAIN_VITE_API_URL

interface RequestOptions extends RequestInit {
  timeout?: number
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeout = 5000, ...fetchOptions } = options

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    })

    if (!res.ok) {
      throw new ApiError({
        code: 'HTTP_ERROR',
        message: `HTTP ${res.status}`,
        status: res.status,
        endpoint,
      })
    }

    try {
      return (await res.json()) as T
    } catch {
      throw new ApiError({
        code: 'PARSE_ERROR',
        message: 'Failed to parse response',
        status: res.status,
        endpoint,
      })
    }
  } catch (err) {
    if (err instanceof ApiError) {
      logger.error('API error', { endpoint, code: err.code, status: err.status })
      throw err
    }

    // сработал AbortController
    if ((err as Error).name === 'AbortError') {
      const apiErr = new ApiError({ code: 'TIMEOUT', message: 'Request timed out', endpoint })
      logger.error('API timeout', { endpoint })
      throw apiErr
    }

    // fetch не смог подключиться вообще
    const apiErr = new ApiError({
      code: 'NETWORK_ERROR',
      message: (err as Error).message,
      endpoint,
    })
    logger.error('Network error', { endpoint, error: apiErr.message })
    throw apiErr
  } finally {
    clearTimeout(timer)
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
}
