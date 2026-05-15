import Store from 'electron-store'

interface StoreSchema {
  isRegistered: boolean
  deviceId: string | null
}

//TODO: заменить store.set на реальную логику регистрации
const store = new Store<StoreSchema>({
  defaults: {
    isRegistered: false,
    deviceId: '123',
  },
})

export default store
