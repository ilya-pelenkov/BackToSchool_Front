import { ReactNode } from 'react'

type TPageContainer = {
  children: ReactNode
}

export function PageContainer({ children }: TPageContainer) {
  return <div style={{ padding: '15px' }}>{children}</div>
}
