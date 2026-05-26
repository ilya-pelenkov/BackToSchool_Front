import Store from 'electron-store'

interface StoreSchema {
  isRegistered: boolean
  isRegisterLoading: boolean
  isRegistrationError: boolean
  authToken: string | null
  terminalId: string | null
}

const store = new Store<StoreSchema>({
  defaults: {
    isRegistered: false,
    isRegisterLoading: false,
    isRegistrationError: false,
    authToken: null,
    terminalId: null,
  },
})

export default store
