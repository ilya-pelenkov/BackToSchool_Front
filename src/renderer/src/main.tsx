import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'

import { DeviceProvider } from './app/providers/device-context-provider'
import { ThemeProvider } from './app/providers/theme'
import { router } from './app/router/router'
import './styles/main.css'

import '@mantine/core/styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <DeviceProvider>
        <RouterProvider router={router} />
      </DeviceProvider>
    </ThemeProvider>
  </StrictMode>
)
