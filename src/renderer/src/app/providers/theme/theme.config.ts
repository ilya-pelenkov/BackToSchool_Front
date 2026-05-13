import { MantineColorsTuple, createTheme } from '@mantine/core'

const primaryColor: MantineColorsTuple = [
  '#ebffff',
  '#d7fdfd',
  '#aafdfd',
  '#7dfdfc',
  '#62fcfc',
  '#56fcfc',
  '#4efdfc',
  '#41e1e1',
  '#30c8c8',
  '#008b8b', //цвет кнопок из предварительного макета
]

export const theme = createTheme({
  primaryColor: 'primaryColor',

  colors: {
    primaryColor,
  },
})
