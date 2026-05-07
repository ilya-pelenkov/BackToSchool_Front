import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'

import { DeviceProvider } from './app/providers/device-context-provider'
import { router } from './app/router/router'
import './styles/main.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DeviceProvider>
      <RouterProvider router={router} />
    </DeviceProvider>
  </StrictMode>
)
