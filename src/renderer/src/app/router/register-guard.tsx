import { useContext } from 'react'
import { Navigate } from 'react-router'

import { CommonLayout } from '@renderer/components/layout/common-layout'
import { Header } from '@renderer/components/layout/header'
import { SplashScreen } from '@renderer/pages/splash-screen'

import { DeviceContext } from '../providers/device-context-provider'

export function RegisteredGuard() {
  const { isRegistered, isLoading, isError } = useContext(DeviceContext)

  if (isLoading) return <SplashScreen />
  if (isError) return <Navigate to="/not-registered" replace />
  return isRegistered ? <CommonLayout header={<Header />} /> : <Navigate to="/not-registered" replace />
}
