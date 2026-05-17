import { app, globalShortcut, net, protocol } from 'electron'

import { electronApp, optimizer } from '@electron-toolkit/utils'
import { is } from '@electron-toolkit/utils'
import { pathToFileURL } from 'url'

import { registerIpcHandlers } from './ipc/ipc'
import { registerSecurityHandlers } from './kiosk-mode-security'
import { registerDevice } from './registration'
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
  await registerDevice()

  const win = createWindow()
  registerSecurityHandlers(win)

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
