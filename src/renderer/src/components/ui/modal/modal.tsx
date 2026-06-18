import { Text, Title } from '@mantine/core'

import { IconButton } from '../icon-button'

type ModalProps = {
  onClose: () => void
  children?: React.ReactNode
  title: string
  text: string
}

export function Modal({ onClose, children, title, text }: ModalProps) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(20, 20, 20, 0.8)',
          zIndex: 300,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          borderRadius: 'var(--mantine-radius-md)',
          padding: '40px 40px 40px 40px',
          zIndex: 301,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ alignSelf: 'end', padding: '40px' }}>
          <IconButton variant="close" icon_size={48} onClick={onClose} color="var(--mantine-color-baseColor-9)" />
        </div>
        <div
          style={{
            marginTop: '80px',
            marginBottom: '60px',
            paddingInline: '60px',
          }}
        >
          <Title order={2} miw={'986px'} mb={'32px'}>
            {title}
          </Title>
          <Text style={{ textAlign: 'center' }}>{text}</Text>
        </div>
        {children}
      </div>
    </>
  )
}
