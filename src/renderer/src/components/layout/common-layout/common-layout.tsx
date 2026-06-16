import { ReactNode } from 'react'
import { Outlet } from 'react-router'

import { AppShell, ScrollArea } from '@mantine/core'

type TCommonLayoutProps = {
  header: ReactNode
}

export function CommonLayout({ header }: TCommonLayoutProps) {
  return (
    <AppShell header={{ height: '345px' }}>
      <AppShell.Header style={{ backgroundColor: 'var(--mantine-color-baseColor-9)', borderBottom: 'none' }}>
        {header}
      </AppShell.Header>

      <AppShell.Main style={{ height: '3840px', backgroundColor: 'var(--mantine-color-baseColor-9)', width: '2160px' }}>
        <ScrollArea style={{ height: '3840px' }}>
          <Outlet />
        </ScrollArea>
      </AppShell.Main>
    </AppShell>
  )
}
