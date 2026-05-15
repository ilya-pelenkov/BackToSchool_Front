import { contextBridge } from 'electron'

import { deviceApi, mediaApi } from './api'

const api = {
  device: deviceApi,
  media: mediaApi,
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api
}
