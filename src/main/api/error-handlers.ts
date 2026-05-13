import { ApiError } from '@shared/request-errors'

import logger from '../logger'

export type ErrorHandler = (err: ApiError) => void

const handlers: ErrorHandler[] = []

export function registerErrorHandler(handler: ErrorHandler): void {
  handlers.push(handler)
}

export function runErrorHandlers(err: ApiError): void {
  for (const handler of handlers) {
    try {
      handler(err)
    } catch (handlerErr) {
      logger.error('Error handler threw', { handlerErr })
    }
  }
}
