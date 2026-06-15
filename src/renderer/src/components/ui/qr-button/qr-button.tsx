import { ReactNode } from 'react'

import { Button } from '@mantine/core'

type QrButtonProps = {
  onClick: () => void
  content: ReactNode
}

export function QrButton({ onClick, content }: QrButtonProps) {
  return (
    <Button
      onClick={onClick}
      style={{
        position: 'absolute',
        bottom: 160,
        left: '50%',
        transform: 'translate(-50%, 0)',
        zIndex: 30,
        color: 'white',
        fontSize: '80px',
        fontWeight: '600',
        padding: '60px 80px',
        height: '217px',
        textTransform: 'uppercase',
      }}
    >
      {content}
    </Button>
  )
}
