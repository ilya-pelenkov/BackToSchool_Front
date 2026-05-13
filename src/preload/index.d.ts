import { ElectronAPI } from '@electron-toolkit/preload'

import { deviceApi } from './api/device.api'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      device: typeof deviceApi
    }
  }
}
