import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

import logger from '../logger'
import { type RetryPreset, calcDelay, getRetryOptions, sleep } from './retry'

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
}

interface DownloadOptions {
  retry?: RetryPreset
  timeout?: number
}

export interface DownloadResult {
  checksum: string
  finalPath: string
}

//обертка над загрузкой файла с повтором запросов при неудаче и timeout
export async function downloadFile(
  url: string,
  basePath: string,
  options: DownloadOptions = {}
): Promise<DownloadResult> {
  const retryOpts = getRetryOptions(options.retry ?? 'default')
  const timeout = options.timeout ?? 30_000

  let lastError: Error | undefined

  for (let attempt = 0; attempt < retryOpts.maxAttempts; attempt++) {
    if (attempt > 0) {
      const delay = calcDelay(attempt - 1, retryOpts)
      logger.warn('Retrying download', { url, attempt, delayMs: Math.round(delay) })
      await sleep(delay)
    }

    try {
      return await downloadOnce(url, basePath, timeout)
    } catch (err) {
      lastError = err as Error
      logger.warn('Download attempt failed', { url, attempt, error: lastError.message })
    }
  }

  logger.error('Download retry attempts ended: download gave up', { url, attempts: retryOpts.maxAttempts })
  throw lastError
}

//загрузка файла
async function downloadOnce(url: string, basePath: string, timeout: number): Promise<DownloadResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  const tempPath = `${basePath}.tmp`

  try {
    const res = await fetch(url, { signal: controller.signal })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    if (!res.body) throw new Error('Empty response body')

    const contentType = res.headers.get('content-type')?.split(';')[0].trim() ?? ''
    const ext = MIME_TO_EXT[contentType]

    if (!ext) {
      throw new Error(`Unsupported content-type: "${contentType}"`)
    }

    fs.mkdirSync(path.dirname(basePath), { recursive: true })

    const file = fs.createWriteStream(tempPath)

    for await (const chunk of res.body) {
      file.write(chunk)
    }

    await new Promise<void>((resolve, reject) => {
      file.end()
      file.on('finish', resolve)
      file.on('error', reject)
    })

    const checksum = await calcChecksum(tempPath)
    const finalPath = `${basePath}${ext}`

    fs.renameSync(tempPath, finalPath)

    return { checksum, finalPath }
  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
    throw err
  } finally {
    clearTimeout(timer)
  }
}

//читает файл и считает его md5-хэш - может использоваться для верификации целостности файла в будущем
function calcChecksum(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5')
    fs.createReadStream(filePath)
      .on('data', chunk => hash.update(chunk))
      .on('end', () => resolve(hash.digest('hex')))
      .on('error', reject)
  })
}
