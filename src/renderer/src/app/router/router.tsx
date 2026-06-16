import { createBrowserRouter, redirect } from 'react-router'

import { CommonLayout } from '@renderer/components/layout/common-layout'
import { FullScreenLayout } from '@renderer/components/layout/full-screen-layout.tsx'
import { Header } from '@renderer/components/layout/header'
import { LazyIdleScreen } from '@renderer/pages/idle-screen'
import { NoContentScreen } from '@renderer/pages/no-content-screen'
import { LazyNotRegisteredScreen } from '@renderer/pages/not-registered-screen'

import { ROUTES } from './routes'
import { StartupGuard } from './startup-guard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <StartupGuard />,
    children: [
      { index: true, loader: () => redirect(ROUTES.idle) },
      { path: ROUTES.idle, element: <FullScreenLayout />, children: [{ index: true, element: <LazyIdleScreen /> }] },
      {
        path: ROUTES.noContent,
        element: <CommonLayout header={<Header />} />,
        children: [{ index: true, element: <NoContentScreen /> }],
      },
    ],
  },
  {
    path: ROUTES.notRegistered,
    element: <CommonLayout header={<Header />} />,
    children: [{ index: true, element: <LazyNotRegisteredScreen /> }],
  },
])
