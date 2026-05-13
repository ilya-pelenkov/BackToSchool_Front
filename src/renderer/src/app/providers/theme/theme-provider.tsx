import { MantineProvider, MantineProviderProps } from '@mantine/core'

import { theme } from './theme.config'

export const ThemeProvider = ({ children, ...props }: MantineProviderProps) => {
  return (
    <MantineProvider theme={theme} {...props}>
      {children}
    </MantineProvider>
  )
}
