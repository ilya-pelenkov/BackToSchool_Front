import Store from 'electron-store'

interface DeviceStoreSchema {
  terminalId: string | null
  lastSync: string | null
  lastHeartbeatAt: number | null
}

export const deviceStore = new Store<DeviceStoreSchema>({
  name: '',
  defaults: {
    terminalId: null,
    lastSync: null,
    lastHeartbeatAt: null,
  },
})
