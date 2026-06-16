import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router'

import { SplashScreen } from '@renderer/pages/splash-screen'

import { DeviceContext } from '../providers/device-context-provider'
import { SyncContext } from '../providers/sync-context-provider'
import { ROUTES } from './routes'

export function StartupGuard() {
  const { isRegistered, isLoading, isError } = useContext(DeviceContext)
  const { isFirstSyncing } = useContext(SyncContext)

  if (isLoading) return <SplashScreen />
  if (isFirstSyncing) return <SplashScreen message="Подождите, идёт загрузка контента..." />
  if (isError) return <Navigate to={ROUTES.notRegistered} replace />
  return isRegistered ? <Outlet /> : <Navigate to={ROUTES.notRegistered} replace />
}
