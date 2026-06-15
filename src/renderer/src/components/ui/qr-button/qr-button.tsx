import { ReactNode, useState } from 'react'

import { Button } from '@mantine/core'

import styles from './styles.module.scss'

type QrButtonProps = {
  onClick: () => void
  content: ReactNode
}

export function QrButton({ onClick, content }: QrButtonProps) {
  const [active, setActive] = useState(false)
  return (
    <div className={styles.qr_button_wrapper}>
      <Button
        onClick={onClick}
        data-active={active}
        onPointerDown={() => setActive(true)}
        onPointerUp={() => setActive(false)}
        onPointerLeave={() => setActive(false)}
        styles={{
          root: {
            height: '217px',
            padding: '60px 80px',
            fontSize: '80px',
            color: 'white',
            fontWeight: 600,
            textTransform: 'uppercase',
            transition: 'transform 0.1s ease',
            ...(active && {
              backgroundColor: 'var(--mantine-color-accentColor-8)',
              transform: 'scale(0.95)',
            }),
          },
        }}
      >
        {content}
      </Button>
    </div>
  )
}
