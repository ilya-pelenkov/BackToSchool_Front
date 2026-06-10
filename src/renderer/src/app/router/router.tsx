import { createBrowserRouter, redirect } from 'react-router'

import { LazyIdleScreen } from '@renderer/pages/idle-screen'
import { LazyNotRegisteredScreen } from '@renderer/pages/not-registered-screen'

import { ROUTES } from './routes'
import { StartupGuard } from './startup-guard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <StartupGuard />, // проверяет isRegistered
    children: [
      { index: true, loader: () => redirect(ROUTES.idle) },
      { path: ROUTES.idle, element: <LazyIdleScreen /> },
    ],
  },
  {
    path: ROUTES.notRegistered,
    element: <LazyNotRegisteredScreen />,
  },
])
