import { IconClose } from '@renderer/assets/icons'

export const ICON_MAP = {
  close: IconClose,
} as const

export type IconVariant = keyof typeof ICON_MAP
