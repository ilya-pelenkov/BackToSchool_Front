import { contextBridge } from 'electron'

import { deviceApi, logApi, mediaApi, networkApi } from './api'

const api = {
  device: deviceApi,
  media: mediaApi,
  network: networkApi,
  log: logApi,
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    if (error instanceof Error) {
      api.log.error(error.message)
    } else {
      api.log.error(`preload contextBridge error`)
    }
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api
}
