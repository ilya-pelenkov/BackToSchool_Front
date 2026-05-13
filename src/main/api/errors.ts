// src/main/api/errors.ts
export type ApiErrorCode = 'HTTP_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT' | 'PARSE_ERROR'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status?: number
  readonly endpoint: string

  constructor({
    code,
    message,
    status,
    endpoint,
  }: {
    code: ApiErrorCode
    message: string
    status?: number
    endpoint: string
  }) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.endpoint = endpoint
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
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}
