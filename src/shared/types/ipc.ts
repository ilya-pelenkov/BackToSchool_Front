import { CachedContent } from './content'

export type TMediaFile = Pick<CachedContent, 'contentId' | 'duration' | 'qr_code_base64'> & {
  path: string
  type: 'video' | 'banner'
}

export type TMediaIpcGetFiles = TMediaFile[]

export const MEDIA_IPC_CHANNELS = {
  CONTENT_CLICK: 'content:click',
} as const

export type ContentClickPayload = {
  contentId: number
}
