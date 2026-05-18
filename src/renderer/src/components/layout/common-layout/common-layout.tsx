import { ReactNode } from 'react'
import { Outlet } from 'react-router'

import { AppShell, ScrollArea } from '@mantine/core'

type TCommonLayoutProps = {
  header: ReactNode
}

export function CommonLayout({ header }: TCommonLayoutProps) {
  return (
    <AppShell
      header={{ height: '10vh' }} //10% от фиксированной высоты окна
    >
      <AppShell.Header c="black">{header}</AppShell.Header>

      <AppShell.Main style={{ height: '90vh' }}>
        <ScrollArea style={{ height: '90vh', width: '100%' }}>
          <Outlet />
        </ScrollArea>
      </AppShell.Main>
    </AppShell>
  )
}
