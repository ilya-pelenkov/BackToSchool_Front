import { ApiError } from '@shared/request-errors'

import logger from '../logger'
import { runErrorHandlers } from './error-handlers'
import { RetryPreset, calcDelay, getRetryOptions } from './retry'

const BASE_URL = import.meta.env.MAIN_VITE_API_URL

interface RequestOptions extends RequestInit {
  timeout?: number
  retry?: RetryPreset // по умолчанию default
}

// Одиночный fetch запрос
async function fetchOnce<T>(endpoint: string, options: RequestOptions): Promise<T> {
  const { timeout = 5000, retry: _retry, ...fetchOptions } = options

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
      const retryAfterMs = res.status === 429 ? parseRetryAfter(res.headers.get('Retry-After')) : undefined

      throw new ApiError({
        code: 'HTTP_ERROR',
        message: `HTTP ${res.status}`,
        status: res.status,
        endpoint,
        retryAfterMs,
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
      logger.debug('fetchOnce error', { endpoint, code: err.code, status: err.status })
      throw err
    }

    // сработал AbortController
    if ((err as Error).name === 'AbortError') {
      const apiErr = new ApiError({ code: 'TIMEOUT', message: 'Request timed out', endpoint })
      logger.debug('fetchOnce timeout', { endpoint })
      throw apiErr
    }

    // fetch не смог подключиться вообще
    const apiErr = new ApiError({
      code: 'NETWORK_ERROR',
      message: (err as Error).message,
      endpoint,
    })
    logger.debug('fetchOnce network error', { endpoint, error: apiErr.message })
    throw apiErr
  } finally {
    clearTimeout(timer)
  }
}

// Обертка с retry логикой
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const preset = options.retry ?? 'default'
  const retryOpts = getRetryOptions(preset)

  let lastError: ApiError | undefined

  for (let attempt = 0; attempt < retryOpts.maxAttempts; attempt++) {
    if (attempt > 0) {
      const delay = lastError?.retryAfterMs ?? calcDelay(attempt - 1, retryOpts)
      logger.warn('Retrying request', { endpoint, attempt, delayMs: Math.round(delay) })
      await sleep(delay)
    }

    try {
      return await fetchOnce<T>(endpoint, options)
    } catch (err) {
      const apiError = err as ApiError
      lastError = apiError

      const attemptsLeft = retryOpts.maxAttempts - attempt - 1

      if (!apiError.retryable || attemptsLeft === 0) {
        logger.error('API request failed', {
          endpoint,
          code: apiError.code,
          status: apiError.status,
          attempt,
          retryable: apiError.retryable,
        })
        runErrorHandlers(apiError)
        throw apiError
      }

      logger.warn('API request error, will retry', {
        endpoint,
        code: apiError.code,
        status: apiError.status,
        attempt,
        attemptsLeft,
      })
    }
  }

  if (lastError === undefined) {
    throw new Error('Unexpected: retry loop exited without error')
  }

  throw lastError
}

// Хелперы
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** Разбираем Retry-After: число секунд или HTTP-date */
function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined
  const seconds = Number(header)
  if (!isNaN(seconds)) return seconds * 1000
  const date = new Date(header)
  if (!isNaN(date.getTime())) return Math.max(0, date.getTime() - Date.now())
  return undefined
}

// ApiClient
export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),

  patch: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }),

  put: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),

  delete: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, { method: 'DELETE', ...options }),
}
