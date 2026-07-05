import { RendererLogLevel } from '@shared/types/ipc'

type ErrorContext = Record<string, unknown>

function isMediaError(value: unknown): value is MediaError {
  return value instanceof MediaError
}

function serializeError(error: unknown): { message: string; stack?: string; name?: string } {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    }
  }
  if (typeof error === 'string') {
    return { message: error }
  }
  return { message: 'Unknown error', stack: undefined, name: undefined }
}

function logRendererEvent(
  level: RendererLogLevel,
  payload: unknown,
  customMessage?: string,
  context?: ErrorContext
): void {
  // payload может быть Error, строкой или просто отсутствовать (для info/warn без объекта ошибки)
  const isErrorLike = payload instanceof Error || typeof payload === 'string'
  const serialized = isErrorLike ? serializeError(payload) : null

  const message = serialized
    ? customMessage
      ? `${customMessage}: ${serialized.message}`
      : serialized.message
    : (customMessage ?? 'Renderer event')

  window.api.log[level](message, {
    ...context,
    ...(serialized
      ? {
          errorName: serialized.name,
          stack: serialized.stack,
        }
      : {}),
    ...(payload !== undefined && !isErrorLike
      ? isMediaError(payload)
        ? {
            message: payload.message,
            name: 'MediaError',
            details: {
              code: payload.code,
            },
          }
        : { rawPayload: payload }
      : {}),
  })
}

export function logError(error: unknown, customMessage?: string, context?: ErrorContext): void {
  logRendererEvent('error', error, customMessage, context)
}

export function logWarn(message: string, context?: ErrorContext): void {
  logRendererEvent('warn', undefined, message, context)
}

export function logInfo(message: string, context?: ErrorContext): void {
  logRendererEvent('info', undefined, message, context)
}
