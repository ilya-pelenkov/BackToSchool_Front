import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router'

import { SplashScreen } from '@renderer/pages/splash-screen'

import { DeviceContext } from '../providers/device-context-provider'
import { SyncContext } from '../providers/sync-context-provider'

export function StartupGuard() {
  const { isRegistered, isLoading, isError } = useContext(DeviceContext)
  const { isFirstSyncing } = useContext(SyncContext)

  if (isLoading) return <SplashScreen />
  if (isFirstSyncing) return <SplashScreen message="Загрузка контента..." />
  if (isError) return <Navigate to="/not-registered" replace />
  return isRegistered ? <Outlet /> : <Navigate to="/not-registered" replace />
}
