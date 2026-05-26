import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'

import { DeviceProvider, NetworkProvider, ThemeProvider } from './app/providers'
import { router } from './app/router/router'
import './styles/main.css'

import '@mantine/core/styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <DeviceProvider>
        <NetworkProvider>
          <RouterProvider router={router} />
        </NetworkProvider>
      </DeviceProvider>
    </ThemeProvider>
  </StrictMode>
)
