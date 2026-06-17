import { Component, type ErrorInfo, type ReactNode } from 'react'

import { DefaultFallback, ErrorBoundaryFallbackProps } from '@renderer/components/default-error-boundary-fallback'

type ErrorBoundaryProps = {
  children: ReactNode
  /** Имя источника для логов — какой именно boundary поймал ошибку ('root', 'media-playlist' и т.п.) */
  source: string
  /** Через сколько мс пробовать перерендерить дочерний компонент заново. 0 — не пробовать автоматически. */
  autoRecoverMs?: number
  /** После скольких падений подряд (быстрее, чем 2×autoRecoverMs после предыдущего восстановления) прекращается retry и вызывается onGiveUp */
  maxConsecutiveFailures?: number
  /** Вызывается при каждой пойманной ошибке — сюда можно передать логирование в main */
  onError?: (error: Error, info: ErrorInfo, source: string) => void
  /** Вызывается один раз, когда исчерпали maxConsecutiveFailures — например, увести на безопасный роут или перезагрузить окно */
  onGiveUp?: (error: Error, source: string) => void
  /** Подменить дефолтный fallback своим UI */
  renderFallback?: (props: ErrorBoundaryFallbackProps) => ReactNode
}

type ErrorBoundaryState = {
  error: Error | null
  secondsLeft: number
  recoveryAttempt: number
}

const DEFAULT_AUTO_RECOVER_MS = 15_000
const DEFAULT_MAX_CONSECUTIVE_FAILURES = 3

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, secondsLeft: 0, recoveryAttempt: 0 }

  private consecutiveFailures = 0
  private lastRecoveredAt = 0
  private countdownTimer: ReturnType<typeof setInterval> | null = null
  private recoverTimer: ReturnType<typeof setTimeout> | null = null

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const {
      source,
      onError,
      onGiveUp,
      maxConsecutiveFailures = DEFAULT_MAX_CONSECUTIVE_FAILURES,
      autoRecoverMs = DEFAULT_AUTO_RECOVER_MS,
    } = this.props

    // если упали почти сразу после предыдущего восстановления — считаем это тем же сбоем, не разовым
    const fellQuickly = Date.now() - this.lastRecoveredAt < autoRecoverMs * 2
    this.consecutiveFailures = fellQuickly ? this.consecutiveFailures + 1 : 1

    onError?.(error, info, source)

    if (this.consecutiveFailures > maxConsecutiveFailures) {
      this.clearTimers()
      onGiveUp?.(error, source)
      return
    }

    this.armAutoRecovery()
  }

  componentWillUnmount(): void {
    this.clearTimers()
  }

  private clearTimers(): void {
    if (this.countdownTimer) clearInterval(this.countdownTimer)
    if (this.recoverTimer) clearTimeout(this.recoverTimer)
    this.countdownTimer = null
    this.recoverTimer = null
  }

  private armAutoRecovery(): void {
    this.clearTimers()
    const ms = this.props.autoRecoverMs ?? DEFAULT_AUTO_RECOVER_MS
    if (ms <= 0) return

    this.setState({ secondsLeft: Math.ceil(ms / 1000) })
    this.countdownTimer = setInterval(() => {
      this.setState(s => ({ secondsLeft: Math.max(0, s.secondsLeft - 1) }))
    }, 1000)
    this.recoverTimer = setTimeout(this.retryNow, ms)
  }

  private retryNow = (): void => {
    this.clearTimers()
    this.lastRecoveredAt = Date.now()
    this.setState({ error: null, secondsLeft: 0 })
  }

  render(): ReactNode {
    const { error, secondsLeft } = this.state
    if (!error) return this.props.children

    const totalSeconds = Math.ceil((this.props.autoRecoverMs ?? DEFAULT_AUTO_RECOVER_MS) / 1000)
    const fallbackProps: ErrorBoundaryFallbackProps = {
      error,
      secondsLeft,
      totalSeconds,
      retryNow: this.retryNow,
      retryAttempt: this.consecutiveFailures,
    }

    return this.props.renderFallback ? this.props.renderFallback(fallbackProps) : <DefaultFallback {...fallbackProps} />
  }
}
