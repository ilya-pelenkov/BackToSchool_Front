import { ReactNode } from 'react'
import { Outlet } from 'react-router'

import { AppShell, ScrollArea } from '@mantine/core'

type TCommonLayoutProps = {
  header: ReactNode
}

export function CommonLayout({ header }: TCommonLayoutProps) {
  return (
    <AppShell
      header={{ height: '345px' }} //9% от фиксированной высоты окна
    >
      <AppShell.Header c="black">{header}</AppShell.Header>

      <AppShell.Main style={{ height: '3495px' }}>
        <ScrollArea style={{ height: '3495px', width: '100%' }}>
          <Outlet />
        </ScrollArea>
      </AppShell.Main>
    </AppShell>
  )
}
