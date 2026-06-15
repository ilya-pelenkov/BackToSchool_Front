import { BrowserWindow, shell } from 'electron'

import { is } from '@electron-toolkit/utils'
import { join } from 'path'

export function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 2160,
    height: 3840,
    show: false,
    autoHideMenuBar: true,
    fullscreen: !is.dev,
    kiosk: !is.dev,
    frame: is.dev,
    resizable: is.dev,
    alwaysOnTop: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: is.dev,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev) mainWindow.webContents.openDevTools({ mode: 'detach' })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

export function sendToRenderer(channel: string, payload?: unknown): void {
  BrowserWindow.getAllWindows()[0]?.webContents.send(channel, payload)
}
