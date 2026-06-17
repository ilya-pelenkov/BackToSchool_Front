import { ReactNode } from 'react'

import { Text } from '@mantine/core'

export type ErrorBoundaryFallbackProps = {
  error: Error
  secondsLeft: number
  totalSeconds: number
  retryNow: () => void
}

export function DefaultFallback({ secondsLeft }: ErrorBoundaryFallbackProps): ReactNode {
  return (
    <div
      style={{
        width: '2160px',
        height: '3840px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--mantine-color-baseColor-9)',
        flexDirection: 'column',
        gap: '150px',
        paddingInline: '200px',
      }}
    >
      <Text c="dimmed" fw={700} fs={'72px'}>
        Что-то пошло не так. Перезапуск через {secondsLeft} с.
      </Text>
    </div>
  )
}
