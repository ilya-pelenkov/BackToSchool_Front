import { ReactNode, createContext, useEffect, useState } from 'react'

interface NetworkContextValue {
  isOnline: boolean
}

const NetworkContext = createContext<NetworkContextValue>({
  isOnline: true,
})

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // текущий статус
    window.api.network.getStatus().then(({ online }) => setIsOnline(online))

    // подписка на изменения
    window.api.network.onStatusChange(({ online }) => setIsOnline(online))
  }, [])

  return <NetworkContext.Provider value={{ isOnline }}>{children}</NetworkContext.Provider>
}
