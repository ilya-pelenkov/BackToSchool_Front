import { useEffect } from 'react'
import { useNavigate } from 'react-router'

import { Text } from '@mantine/core'

import { ROUTES } from '@renderer/app/router/routes'

export function NoContentScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = window.api.media.onUpdated(() => {
      window.api.media.getFiles().then(files => {
        if (files.length > 0) {
          navigate(ROUTES.idle)
        }
      })
    })
    return unsubscribe
  }, [navigate])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '100px',
        justifyContent: 'center',
        alignItems: 'center',
        paddingInline: '200px',
      }}
    >
      <Text c="dimmed" fw={700} fz={'80px'}>
        Нет контента для воспроизведения
      </Text>
    </div>
  )
}
