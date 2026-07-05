import * as crypto from 'crypto'
import { machineIdSync } from 'node-machine-id'
import * as os from 'os'

function getMac(): string | null {
  for (const [name, ifaces] of Object.entries(os.networkInterfaces())) {
    if (!/^(ethernet|eth|en|local area connection)/i.test(name)) continue
    const found = ifaces?.find(i => i.mac && i.mac !== '00:00:00:00:00:00')
    if (found) return found.mac
  }
  for (const ifaces of Object.values(os.networkInterfaces())) {
    const found = ifaces?.find(i => i.mac && i.mac !== '00:00:00:00:00:00')
    if (found) return found.mac
  }
  return null
}

export function getDeviceKey(): string {
  const machineId = machineIdSync()
  const mac = getMac()
  return crypto
    .createHash('sha256')
    .update((machineId || '') + (mac || ''))
    .digest('hex')
}
