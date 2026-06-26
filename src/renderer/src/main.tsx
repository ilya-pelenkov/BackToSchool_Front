import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'

import { ErrorBoundary } from './app/error-boundary'
import { DeviceProvider, NetworkProvider, SyncProvider, ThemeProvider } from './app/providers'
import { router } from './app/router/router'
import './styles/fonts.css'
import './styles/main.css'
import { reportReactBoundaryError } from './utils'

import '@mantine/core/styles.css'

/* ----------Для ресайза в dev------------*/

function applyKioskScale() {
  const root = document.getElementById('root')
  if (!root) return

  const scaleX = window.innerWidth / 2160
  const scaleY = window.innerHeight / 3840

  // fit: вписываем целиком, не обрезаем
  const scale = Math.min(scaleX, scaleY)

  root.style.transform = `scale(${scale})`

  // Центрируем вручную, потому что transform не меняет layout
  const offsetX = (window.innerWidth - 2160 * scale) / 2
  const offsetY = (window.innerHeight - 3840 * scale) / 2

  root.style.left = `${offsetX}px`
  root.style.top = `${offsetY}px`
  root.style.position = 'absolute' // нужно для left/top
}

applyKioskScale()

if (import.meta.env.DEV) {
  window.addEventListener('resize', applyKioskScale)
}

/* ----------Для ресайза в dev------------*/

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <DeviceProvider>
        <SyncProvider>
          <NetworkProvider>
            <ErrorBoundary
              source="root"
              autoRecoverMs={30_000}
              onError={reportReactBoundaryError}
              onGiveUp={() => window.location.reload()} // пересоздается все окно, так как ErrorBoundary выше роутера
            >
              <RouterProvider router={router} />
            </ErrorBoundary>
          </NetworkProvider>
        </SyncProvider>
      </DeviceProvider>
    </ThemeProvider>
  </StrictMode>
)
