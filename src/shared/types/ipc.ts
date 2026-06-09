import { CachedContent } from './content'

export type TMediaFile = Pick<CachedContent, 'contentId' | 'duration' | 'qr_code_base64'> & {
  path: string
  type: 'video' | 'banner'
}

export type TMediaIpcGetFiles = TMediaFile[]
