import { CachedContent } from './content'

// ─── Каналы ───────────────────────────────────────────────────────────────────

export const DEVICE_IPC_CHANNELS = {
  IS_REGISTERED: 'device:isRegistered',
  GET_REGISTRATION_STATUS: 'device:getRegistrationStatus',
  REGISTRATION_DONE: 'registration:done',
  REGISTRATION_ATTEMPT: 'registration:attempt',
} as const

export const MEDIA_IPC_CHANNELS = {
  GET_FILES: 'media:getFiles',
  UPDATED: 'media:updated',
  FIRST_SYNC_STARTED: 'media:firstSyncStarted',
  FIRST_SYNC_FINISHED: 'media:firstSyncFinished',
  REQUEST_FORCE_SYNC: 'media:requestForceSync',
  CONTENT_CLICK: 'content:click',
} as const

export const NETWORK_IPC_CHANNELS = {
  GET_STATUS: 'network:getStatus',
  STATUS_CHANGE: 'network:status',
} as const

// ─── Payload-типы ─────────────────────────────────────────────────────────────

export type ContentClickPayload = {
  contentId: number
}

export type RegistrationStatusPayload = {
  isLoading: boolean
  isRegistered: boolean
  isError: boolean
}

export type RegistrationDonePayload = {
  success: boolean
}

export type RegistrationAttemptPayload = {
  attempt: number
  maxAttempts: number
}

export type NetworkStatusPayload = {
  online: boolean
}

export type TMediaFile = Pick<CachedContent, 'contentId' | 'duration' | 'qr_code_base64'> & {
  path: string
  type: 'video' | 'banner'
}

export type TMediaIpcGetFiles = TMediaFile[]
