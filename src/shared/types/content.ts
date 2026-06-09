export type Content = {
  id: number
  type: 'banner' | 'video'
  url: string
  duration: number
  schedule: {
    start_time: string //'07:59:24.502Z'
    end_time: string // '07:59:24.502Z'
    days_of_week: string[]
  }
  target_url: string
  qr_code_base64: string
}

export type CachedContent = {
  contentId: number
  type: 'banner' | 'video'
  localPath: string
  remoteUrl: string
  checksum: string
  downloadedAt: string
  duration: number
  schedule: Content['schedule']
  qr_code_base64?: string
  qr_code_svg?: string
}
