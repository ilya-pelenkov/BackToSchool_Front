import { useContext } from 'react'

import { DeviceContext } from '@renderer/app/providers/device-context-provider'

export function SplashScreen() {
  const { retryInfo } = useContext(DeviceContext)
  return (
    <>
      <div>это экран загрузки приложения, здесь будет красивое лого</div>
      {retryInfo && (
        <p>
          Подключение... попытка {retryInfo.attempt} из {retryInfo.maxAttempts}
        </p>
      )}
    </>
  )
}
