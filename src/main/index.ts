import { app, globalShortcut, net, protocol } from 'electron'

import { electronApp, optimizer } from '@electron-toolkit/utils'
import { is } from '@electron-toolkit/utils'
import { pathToFileURL } from 'url'

import { runHeartbeat, shouldSendHeartbeatOnStart } from './heartbeat'
import { registerIpcHandlers } from './ipc/ipc'
import { registerSecurityHandlers } from './kiosk-mode-security'
import { registerDevice } from './registration'
import { initScheduler } from './scheduler'
import { deviceStore, registrationStore } from './store'
import { createWindow } from './window'

protocol.registerSchemesAsPrivileged([
  { scheme: 'media', privileges: { secure: true, standard: false, stream: true, bypassCSP: true } },
])

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.back-to-school.kiosk')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerIpcHandlers()

  const win = createWindow()
  registerSecurityHandlers(win)

  //проверка регистрации устройства - если нет данных, то отправялется запрос на регистрацию
  const authToken = registrationStore.get('authToken')
  const terminalId = deviceStore.get('terminalId')
  if (!authToken || !terminalId) {
    // ждём регистрацию, потом heartbeat и sync при необходимости
    registerDevice().then(() => {
      if (shouldSendHeartbeatOnStart()) runHeartbeat()
    })
  } else {
    // уже есть регистрация — сразу heartbeat и sync при необходимости
    if (shouldSendHeartbeatOnStart()) runHeartbeat()
  }

  initScheduler()

  // только в dev — чтобы можно было закрыть окно
  if (is.dev) {
    app.on('window-all-closed', () => {
      app.quit()
    })
  }

  app.on('will-quit', () => {
    globalShortcut.unregisterAll()
  })

  protocol.handle('media', request => {
    const filePath = decodeURIComponent(request.url.slice('media://'.length))
    return net.fetch(pathToFileURL(filePath).toString())
  })
})
