import { ReactNode, createContext, useEffect, useState } from 'react'

interface DeviceContextValue {
  isRegistered: boolean
  isLoading: boolean
  isError: boolean
}

const DeviceContext = createContext<DeviceContextValue>({
  isRegistered: false,
  isLoading: true,
  isError: false,
})

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    window.api.device.getRegistrationStatus().then(status => {
      if (!status.isLoading) {
        // регистрация уже завершилась до монтирования — читаем из store
        setIsRegistered(status.isRegistered)
        setIsError(status.isError)
        setIsLoading(false)
        return
      }
      // регистрация ещё идёт — ждём событие из main
      window.api.device.onRegistrationDone(result => {
        setIsRegistered(result.success)
        setIsError(!result.success)
        setIsLoading(false)
      })
    })
  }, [])

  return <DeviceContext.Provider value={{ isRegistered, isLoading, isError }}>{children}</DeviceContext.Provider>
}

export { DeviceContext }
