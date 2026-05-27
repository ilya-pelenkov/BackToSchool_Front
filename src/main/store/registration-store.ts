import Store from 'electron-store'

interface RegistrationSchema {
  isRegistered: boolean
  isRegisterLoading: boolean
  isRegistrationError: boolean
  authToken: string | null
}

export const registrationStore = new Store<RegistrationSchema>({
  name: 'registration',
  defaults: {
    isRegistered: false,
    isRegisterLoading: false,
    isRegistrationError: false,
    authToken: null,
  },
})
