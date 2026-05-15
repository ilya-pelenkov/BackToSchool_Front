import { useEffect, useState } from 'react'

import { Text } from '@mantine/core'

export function HeaderTimer() {
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        })
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])
  return (
    <Text size="md" c="white" fw={300}>
      {currentTime}
    </Text>
  )
}
