import { useEffect, useRef, useState } from 'react'

type UseAutoCloseTimerOptions = {
  /** Активен ли таймер (например, открыта ли модалка) */
  isActive: boolean
  /** Полная длительность таймера в мс */
  duration: number
  /** За сколько мс до конца показывать предупреждение */
  warningThreshold: number
  /** Вызывается по истечении таймера */
  onTimeout: () => void
  /** Сколько раз можно продлевать таймер */
  maxExtendAttempts: number
}

type UseAutoCloseTimerResult = {
  /** Показывать ли warning-баннер. Имеет смысл только при isActive === true */
  isWarning: boolean
  /** Прогресс оставшегося времени от 0 (конец) до 1 (старт). Имеет смысл только при isActive === true */
  progress: number
  /** Продлить таймер на extendBy мс, сбросив warning. Игнорируется после maxExtendAttempts попыток */
  extend: (extendBy: number) => void
}

/**
 * Управляет таймером автозакрытия с промежуточной warning-стадией.
 *
 * Важно: isWarning/progress не сбрасываются принудительно при isActive === false —
 * вместо этого RAF-цикл просто не запускается, пока isActive === false, а значения
 * естественно переустанавливаются в начале каждого нового цикла при isActive === true.
 * Это сделано, чтобы не вызывать setState синхронно в "закрывающей" ветке эффекта
 * (react-hooks/set-state-in-effect не допускает это как hard error в данном проекте).
 * Потребитель хука не должен показывать progress/isWarning, когда сама модалка закрыта,
 * поэтому "протухшие" значения здесь не наблюдаемы пользователем.
 */
export function useAutoCloseTimer({
  isActive,
  duration,
  warningThreshold,
  onTimeout,
  maxExtendAttempts,
}: UseAutoCloseTimerOptions): UseAutoCloseTimerResult {
  const [isWarning, setIsWarning] = useState(false)
  const [progress, setProgress] = useState(1)

  const deadlineRef = useRef<number>(0)
  const extendCountRef = useRef<number>(0)

  const onTimeoutRef = useRef(onTimeout)
  useEffect(() => {
    onTimeoutRef.current = onTimeout
  }, [onTimeout])

  useEffect(() => {
    if (!isActive) return

    deadlineRef.current = Date.now() + duration
    extendCountRef.current = 0

    let rafId: number

    const loop = (): void => {
      const remaining = deadlineRef.current - Date.now()
      const canExtend = extendCountRef.current < maxExtendAttempts

      if (remaining <= 0) {
        setProgress(0)
        setIsWarning(false)
        onTimeoutRef.current()
        return
      }

      setProgress(remaining / duration)
      setIsWarning(canExtend && remaining <= warningThreshold)

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(rafId)
  }, [isActive, duration, warningThreshold, maxExtendAttempts])

  const extend = (extendBy: number): void => {
    if (extendCountRef.current >= maxExtendAttempts) return
    deadlineRef.current = Date.now() + extendBy
    extendCountRef.current += 1
    setIsWarning(false)
  }

  return { isWarning, progress, extend }
}
