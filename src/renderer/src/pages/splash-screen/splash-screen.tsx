import { useContext } from 'react'

import { DeviceContext } from '@renderer/app/providers/device-context-provider'

type TSplashScreenProps = {
  message?: string
}

export function SplashScreen({ message }: TSplashScreenProps) {
  const { retryInfo } = useContext(DeviceContext)
  return (
    <>
      <div>это экран загрузки приложения, здесь будет красивое лого</div>
      {message && <p>{message}</p>}
      {retryInfo && (
        <p>
          Подключение... попытка {retryInfo.attempt} из {retryInfo.maxAttempts}
        </p>
      )}
    </>
  )
}
