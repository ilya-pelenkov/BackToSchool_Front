import { useContext } from 'react'
import { Navigate } from 'react-router'

import { CommonLayout } from '@renderer/components/layout/common-layout'
import { SplashScreen } from '@renderer/pages/splash-screen'

import { DeviceContext } from '../providers/device-context-provider'

export function RegisteredGuard() {
  const { isRegistered, isLoading } = useContext(DeviceContext)

  if (isLoading) return <SplashScreen />
  return isRegistered ? <CommonLayout /> : <Navigate to="/not-registered" replace />
}
