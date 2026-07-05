import { app, globalShortcut, protocol } from 'electron'

import { electronApp, optimizer } from '@electron-toolkit/utils'
import { is } from '@electron-toolkit/utils'
import fs from 'fs'

import { cacheManager } from './cache'
import { registerIpcHandlers } from './ipc'
import { registerSecurityHandlers } from './kiosk-mode-security'
import log from './logger'
import { registerDevice } from './registration/registration'
import { initScheduler, runHeartbeat, runSync, shouldSendHeartbeatOnStart, shouldSyncOnStart } from './scheduler'
import { contentStore, deviceStore, registrationStore } from './store'
import { createWindow } from './window'

process.on('uncaughtException', error => {
  log.error('Uncaught exception:', error)
})

process.on('unhandledRejection', reason => {
  log.error('Unhandled rejection:', reason)
})

protocol.registerSchemesAsPrivileged([
  { scheme: 'media', privileges: { secure: true, standard: true, stream: true, bypassCSP: true } },
])

app.whenReady().then(async () => {
  log.info('App ready, initializing kiosk window')
  electronApp.setAppUserModelId('com.back-to-school.kiosk')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerIpcHandlers()

  const win = createWindow()
  registerSecurityHandlers(win)

  try {
    cacheManager.init()
  } catch (error) {
    log.error('cacheManager.init failed:', error)
  }

  if (is.dev) registrationStore.clear() //- для тестирования регистрации, TODO: удалить
  if (is.dev) contentStore.clear() //- для тестирования загрузки контента, TODO: удалить

  //проверка регистрации устройства - если нет данных, то отправялется запрос на регистрацию
  const authToken = registrationStore.get('authToken')
  const terminalId = deviceStore.get('terminalId')

  win.webContents.once('did-finish-load', () => {
    if (!authToken || !terminalId) {
      // ждём регистрацию, потом heartbeat и sync при необходимости
      registerDevice().then(() => {
        if (shouldSendHeartbeatOnStart()) runHeartbeat()
        if (shouldSyncOnStart()) runSync()
      })
    } else {
      // уже есть регистрация — сразу heartbeat и sync при необходимости
      if (shouldSendHeartbeatOnStart()) runHeartbeat()
      if (shouldSyncOnStart()) runSync()
    }

    initScheduler()
  })

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
    const url = new URL(request.url)
    const contentId = Number(url.pathname.slice(1))

    if (Number.isNaN(contentId)) {
      log.error('Invalid media request: bad contentId', { url: request.url })
      return new Response('Bad Request', { status: 400 })
    }

    const item = cacheManager.getById(contentId)
    if (!item) {
      log.error('Media request: content not found', { contentId })
      return new Response('Not Found', { status: 404 })
    }

    // return net.fetch(pathToFileURL(item.localPath).toString())

    const filePath = item.localPath
    if (!fs.existsSync(filePath)) {
      log.error('Media request: file not found on disk', { contentId, filePath })
      return new Response('Not Found', { status: 404 })
    }

    const stat = fs.statSync(filePath)
    const fileSize = stat.size
    const range = request.headers.get('range')
    const contentType = filePath.endsWith('.mp4') ? 'video/mp4' : filePath.endsWith('.png') ? 'image/png' : 'image/jpeg'

    const createStream = (start: number, end: number) => {
      const stream = fs.createReadStream(filePath, { start, end })
      return new ReadableStream({
        start(controller) {
          stream.on('data', chunk => controller.enqueue(new Uint8Array(chunk as Buffer)))
          stream.on('end', () => controller.close())
          stream.on('error', err => controller.error(err))
        },
        cancel() {
          stream.destroy()
        },
      })
    }

    if (range) {
      const match = /bytes=(\d+)-(\d*)/.exec(range)
      const start = match ? parseInt(match[1], 10) : 0
      const end = match && match[2] ? parseInt(match[2], 10) : fileSize - 1

      return new Response(createStream(start, end), {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(end - start + 1),
          'Content-Type': contentType,
        },
      })
    }

    return new Response(createStream(0, fileSize - 1), {
      status: 200,
      headers: {
        'Content-Length': String(fileSize),
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      },
    })
  })
})
