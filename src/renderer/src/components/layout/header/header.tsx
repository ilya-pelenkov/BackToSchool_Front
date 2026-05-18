import { HeaderTimer } from '@renderer/components/ui'

export function Header() {
  return (
    <div
      style={{
        backgroundColor: 'var(--mantine-color-primaryColor-8)',
        height: '10vh',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '10px',
      }}
    >
      <HeaderTimer />
    </div>
  )
}
