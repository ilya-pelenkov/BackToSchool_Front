import { ElectronAPI } from '@electron-toolkit/preload'

import { deviceApi, mediaApi, networkApi } from './api'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      device: typeof deviceApi
      media: typeof mediaApi
      network: typeof networkApi
    }
  }
}
