import type { ErrorInfo } from 'react'

export function reportReactBoundaryError(error: Error, info: ErrorInfo, source: string): void {
  window.api.log.error(error.message, {
    stack: error.stack,
    componentStack: info.componentStack ?? undefined,
    source,
    route: window.location.hash || window.location.pathname,
  })
}
