import { MantineColorsTuple, createTheme } from '@mantine/core'

const accentColor: MantineColorsTuple = [
  '#fff0e4',
  '#ffe0cf',
  '#fbbf9f',
  '#f79c6c',
  '#f47e41',
  '#f36b25',
  '#ea580c', // 6 оттенок - основной для кнопок
  '#d85109',
  '#c44a0a', // 8 оттенок - активное состояние для кнопок
  '#a93a00',
]

const baseColor: MantineColorsTuple = [
  '#ffffff', // базовый белый
  '#e7e7e7',
  '#cdcdcd',
  '#b2b2b2',
  '#9a9a9a',
  '#8b8b8b',
  '#848484',
  '#717171',
  '#656565',
  '#141414', // базовый черный - цвет шрифта
]

export const theme = createTheme({
  primaryColor: 'accentColor',
  primaryShade: 6,

  colors: {
    accentColor,
    baseColor,
  },

  fontFamily: 'Inter, sans-serif',

  headings: {
    fontWeight: '700',
    sizes: {
      h2: {
        fontSize: '68px',
      },
    },
  },

  radius: {
    sm: '2rem', //32px
    md: '2.5rem', //40px
  },

  defaultRadius: 'sm',

  components: {
    Title: {
      defaultProps: {
        c: 'var(--mantine-color-baseColor-9)',
      },
    },
    Text: {
      defaultProps: {
        c: 'var(--mantine-color-baseColor-9)',
        fw: 400,
        size: '60px',
      },
    },
  },
})
