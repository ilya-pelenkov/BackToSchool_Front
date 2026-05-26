import Store from 'electron-store'

interface NetworkSchema {
  isOnline: boolean
}

export const networkStore = new Store<NetworkSchema>({
  name: 'network',
  defaults: {
    isOnline: true,
  },
})
