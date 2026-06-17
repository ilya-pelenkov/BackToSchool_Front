import { Text } from '@mantine/core'

export type ErrorBoundaryFallbackProps = {
  error: Error
  secondsLeft: number
  totalSeconds: number
  retryNow: () => void
  retryAttempt: number
}

export function DefaultFallback({ secondsLeft, retryAttempt }: ErrorBoundaryFallbackProps) {
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
      <Text c="white" fw={700} size={'80px'} style={{ textAlign: 'center' }}>
        Что-то пошло не так.
      </Text>
      <Text c="dimmed" fw={700} size={'72px'} style={{ textAlign: 'center' }}>
        {retryAttempt > 1
          ? `Перезапуск через ${secondsLeft} секунд, попытка ${retryAttempt}.`
          : `Перезапуск через ${secondsLeft} секунд.`}
      </Text>
    </div>
  )
}
