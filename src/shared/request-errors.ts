export type ApiErrorCode = 'HTTP_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT' | 'PARSE_ERROR'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status?: number
  readonly endpoint: string
  readonly retryAfterMs?: number

  constructor({
    code,
    message,
    status,
    endpoint,
    retryAfterMs,
  }: {
    code: ApiErrorCode
    message: string
    status?: number
    endpoint: string
    retryAfterMs?: number
  }) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.endpoint = endpoint
    this.retryAfterMs = retryAfterMs
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  get isServerError(): boolean {
    return (this.status ?? 0) >= 500
  }

  get isTimeout(): boolean {
    return this.code === 'TIMEOUT'
  }

  get isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR'
  }

  get retryable(): boolean {
    if (this.code === 'NETWORK_ERROR' || this.code === 'TIMEOUT') return true
    if (this.code === 'HTTP_ERROR' && this.status !== undefined) {
      return this.status === 429 || this.status >= 500
    }
    return false
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}
