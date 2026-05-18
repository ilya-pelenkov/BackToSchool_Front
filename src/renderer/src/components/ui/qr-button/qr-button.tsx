import { ReactNode } from 'react'

type QrButtonProps = {
  onClick: () => void
  content: ReactNode
}

export function QrButton({ onClick, content }: QrButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translate(-50%, 0)',
        zIndex: 10,
        borderRadius: '50%',
        border: '3px solid transparent',
        width: '100px',
        height: '100px',
        backgroundColor: 'var(--mantine-color-primaryColor-9)',
        color: 'white',
        fontSize: '24px',
        fontWeight: '500',
      }}
    >
      {content}
    </button>
  )
}
