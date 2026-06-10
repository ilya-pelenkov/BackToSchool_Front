import { ReactNode, createContext, useEffect, useState } from 'react'

interface SyncContextValue {
  isFirstSyncing: boolean
}

const SyncContext = createContext<SyncContextValue>({ isFirstSyncing: false })

export function SyncProvider({ children }: { children: ReactNode }) {
  const [isFirstSyncing, setIsFirstSyncing] = useState(false)
  useEffect(() => {
    window.api.media.onFirstSyncStarted(() => setIsFirstSyncing(true))
    window.api.media.onFirstSyncFinished(() => setIsFirstSyncing(false))
  }, [])
  return <SyncContext.Provider value={{ isFirstSyncing }}>{children}</SyncContext.Provider>
}

export { SyncContext }
