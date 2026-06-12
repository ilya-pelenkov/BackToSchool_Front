import Logo from '@renderer/assets/images/logo_header.png'
import { HeaderTimer } from '@renderer/components/ui'

export function Header() {
  return (
    <div
      style={{
        backgroundColor: 'transparent',
        height: '345px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '40px 80px',
        zIndex: 100,
      }}
    >
      <div
        style={{
          width: '220px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img src={Logo} width="100%" />
      </div>
      <HeaderTimer />
    </div>
  )
}
