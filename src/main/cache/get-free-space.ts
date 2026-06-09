import fs from 'fs'

import { CACHE_DIR } from './cache-manager'

export async function getFreeSpace(): Promise<number> {
  const { bfree, bsize } = await fs.promises.statfs(CACHE_DIR)
  return bfree * bsize
}
