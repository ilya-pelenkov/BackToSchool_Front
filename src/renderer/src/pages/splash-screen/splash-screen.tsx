import { useContext } from 'react'

import { Text } from '@mantine/core'

import { DeviceContext } from '@renderer/app/providers/device-context-provider'
import logo from '@renderer/assets/images/logo_header.png'

type TSplashScreenProps = {
  message?: string
}

export function SplashScreen({ message }: TSplashScreenProps) {
  const { retryInfo } = useContext(DeviceContext)
  return (
    <div
      style={{
        width: '2160px',
        height: '3840px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--mantine-color-baseColor-9)',
        flexDirection: 'column',
        gap: '150px',
        paddingInline: '200px',
      }}
    >
      <img src={logo} alt="лого приложения"></img>
      {message && (
        <>
          <Text c="dimmed" fw={700} fs={'72px'}>
            {message}
          </Text>
        </>
      )}
      {retryInfo && (
        <Text c="dimmed" fw={700} fs={'72px'}>
          Подключение... попытка {retryInfo.attempt} из {retryInfo.maxAttempts}
        </Text>
      )}
    </div>
  )
}
