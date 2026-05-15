import { BrowserWindow, app, globalShortcut } from 'electron'

import { is } from '@electron-toolkit/utils'

const CUSTOM_CLOSE_APP_HOTKEY = 'Escape'

export function registerSecurityHandlers(win: BrowserWindow): void {
  // кастомный hotkey для закрытия приложения - срабатывает при повторном нажатии в течение 3000мс (3 сек)
  let firstPress = 0
  globalShortcut.register(CUSTOM_CLOSE_APP_HOTKEY, () => {
    const now = Date.now()
    if (now - firstPress < 3000) {
      app.exit(0)
    } else {
      firstPress = now
    }
  })

  if (is.dev) return // в dev-режиме ничего не блокируем

  // Блокировка системных клавиш
  globalShortcut.registerAll(
    [
      'F11', // toggle fullscreen
      'F12', // DevTools
      'Alt+F4', // закрыть приложение
      'Ctrl+F4', // закрыть вкладку
      'Ctrl+W', // закрыть окно
      'Ctrl+R', // перезагрузить страницу
      'Ctrl+Shift+R', // hard reload
      'Ctrl+Shift+I', // открыть DevTools
      'Ctrl+Shift+J', // DevTools (Chrome)
      'Ctrl+Shift+C', // инспектор элементов
      'Meta', // Win-клавиша
      'Ctrl+Escape', // открыть Start menu
    ],
    () => false
  )

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
