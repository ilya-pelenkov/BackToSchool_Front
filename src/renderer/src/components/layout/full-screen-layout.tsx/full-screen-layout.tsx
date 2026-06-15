import { Outlet } from 'react-router'

export function FullScreenLayout() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
      <Outlet />
    </div>
  )
}
