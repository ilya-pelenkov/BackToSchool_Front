import { ReactNode, createContext, useEffect, useState } from 'react'

interface DeviceContextValue {
  isRegistered: boolean
  isLoading: boolean
}

const DeviceContext = createContext<DeviceContextValue>({
  isRegistered: false,
  isLoading: true,
})

const SPLASH_SCREEN_MAX_SHOW_TIME = 5000

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), SPLASH_SCREEN_MAX_SHOW_TIME)

    window.api.device
      .isRegistered()
      .then(setIsRegistered)
      .finally(() => {
        clearTimeout(timeout)
        setIsLoading(false)
      })

    return () => clearTimeout(timeout)
  }, [])

  return <DeviceContext.Provider value={{ isRegistered, isLoading }}>{children}</DeviceContext.Provider>
}

export { DeviceContext }
