import { registerErrorHandler } from './error-handlers'

export function setupErrorHandlers(): void {
  registerErrorHandler(err => {
    if (err.isUnauthorized) {
      // TODO: прописать логику
    }
  })

  registerErrorHandler(err => {
    if (err.isNetworkError || err.isTimeout) {
      // TODO: прописать логику
    }
  })
}
