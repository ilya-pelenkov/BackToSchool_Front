import fs from 'fs'

import { CACHE_DIR } from './cache-manager'

export async function getFreeSpace(): Promise<number> {
  const { bfree, bsize } = await fs.promises.statfs(CACHE_DIR)
  return bfree * bsize
}

export function isValidBase64Image(str: string): boolean {
  return /^data:image\/(png|svg\+xml|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(str)
}
