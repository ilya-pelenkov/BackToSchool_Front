export type RetryPreset = 'critical' | 'default' | 'heartbeat'

export interface RetryOptions {
  maxAttempts: number
  baseDelay: number // ms
  maxDelay: number // ms
}

const PRESETS: Record<RetryPreset, RetryOptions> = {
  critical: { maxAttempts: 5, baseDelay: 1000, maxDelay: 30_000 },
  default: { maxAttempts: 3, baseDelay: 500, maxDelay: 10_000 },
  heartbeat: { maxAttempts: 1, baseDelay: 0, maxDelay: 0 },
}

export function getRetryOptions(preset: RetryPreset): RetryOptions {
  return PRESETS[preset]
}

/** Full jitter: равномерное случайное число в [0, cap].
 *  Лучше чем "equal jitter" для случая когда много устройств
 *  одновременно потеряли сеть (thundering herd). */
export function calcDelay(attempt: number, opts: RetryOptions): number {
  const exponential = opts.baseDelay * 2 ** attempt
  const cap = Math.min(exponential, opts.maxDelay)
  return Math.random() * cap
}

// Хелперы
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
