import { createBrowserRouter, redirect } from 'react-router'

import { LazyIdleScreen } from '@renderer/pages/idle-screen'
import { NoContentScreen } from '@renderer/pages/no-content-screen'
import { LazyNotRegisteredScreen } from '@renderer/pages/not-registered-screen'
import { SplashScreen } from '@renderer/pages/splash-screen'

import { ROUTES } from './routes'
import { StartupGuard } from './startup-guard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <StartupGuard />, // проверяет isRegistered
    children: [
      { index: true, loader: () => redirect(ROUTES.idle) },
      { path: ROUTES.idle, element: <LazyIdleScreen /> },
      { path: ROUTES.noContent, element: <NoContentScreen /> },
      { path: ROUTES.splash, element: <SplashScreen /> },
    ],
  },
  {
    path: ROUTES.notRegistered,
    element: <LazyNotRegisteredScreen />,
  },
])
