type ModalProps = {
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ onClose, children }: ModalProps) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 20,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          borderRadius: 12,
          padding: 32,
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {children}
        <button onClick={onClose}>Закрыть</button>
      </div>
    </>
  )
}
