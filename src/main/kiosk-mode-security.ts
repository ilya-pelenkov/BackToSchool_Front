import { BrowserWindow, app, globalShortcut } from 'electron'

import { is } from '@electron-toolkit/utils'

import log from './logger'

const CUSTOM_CLOSE_APP_HOTKEY = 'Escape' // TODO: продумать клавишу для закрытия приложения

export function registerSecurityHandlers(win: BrowserWindow): void {
  // кастомный hotkey для закрытия приложения - срабатывает при повторном нажатии в течение 3000мс (3 сек)
  let firstPress = 0
  try {
    const success = globalShortcut.register(CUSTOM_CLOSE_APP_HOTKEY, () => {
      const now = Date.now()

      if (now - firstPress < 3000) {
        app.exit(0)
      } else {
        firstPress = now
      }
    })

    if (!success) {
      log.warn(`Shortcut not registered: ${CUSTOM_CLOSE_APP_HOTKEY}`)
    }
  } catch (err) {
    log.error(`Failed to register shortcut: ${CUSTOM_CLOSE_APP_HOTKEY}`, err)
  }

  if (is.dev) return // в dev-режиме ничего не блокируем

  const shortcuts = [
    'F11', // toggle fullscreen
    'F12', // DevTools
    'Alt+F4', // закрыть приложение - проверить работу на устройстве, может не заблокироваться
    'Ctrl+F4', // закрыть вкладку
    'Ctrl+W', // закрыть окно
    'Ctrl+R', // перезагрузить страницу
    'Ctrl+Shift+R', // hard reload
    'Ctrl+Shift+I', // открыть DevTools
    'Ctrl+Shift+J', // DevTools (Chrome)
    'Ctrl+Shift+C', // инспектор элементов
    // 'Meta', // Win-клавиша - не блокируется в windows на уровне Electron
    'Ctrl+Escape', // открыть Start menu - проверить работу на устройстве, может не заблокироваться
    'Alt+Tab', //проверить работу на устройстве, может не заблокироваться
    'Win+Tab', //проверить работу на устройстве, может не заблокироваться
    'Ctrl+Shift+Esc', //проверить работу на устройстве, может не заблокироваться
    'Ctrl+Alt+Del', //проверить работу на устройстве, может не заблокироваться
  ]

  for (const shortcut of shortcuts) {
    try {
      const success = globalShortcut.register(shortcut, () => false)

      if (!success) {
        log.warn(`Shortcut not registered: ${shortcut}`)
      }
    } catch (err) {
      log.error(`Failed to register shortcut: ${shortcut}`, err)
    }
  }

  // Отключение контекстного меню
  win.webContents.on('context-menu', e => {
    e.preventDefault()
  })

  // Блокировка навигации
  win.webContents.on('will-navigate', (e, url) => {
    if (url !== win.webContents.getURL()) {
      e.preventDefault()
    }
  })

  // Блокировка открытия новых окон
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))

  // Страховка отключения DevTools
  win.webContents.on('devtools-opened', () => {
    win.webContents.closeDevTools()
  })

  // Скрытие курсора
  win.webContents.on('did-finish-load', () => {
    win.webContents.insertCSS('* { cursor: none !important }')
  })

  //  Обработка попытки закрыть приложение
  win.on('close', e => {
    e.preventDefault()
  })
}
