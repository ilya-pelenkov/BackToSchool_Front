import cron from 'node-cron'

import logger from '../logger'
import { runHeartbeat } from './heartbeat'
import { runSync } from './sync-device'

export function initScheduler(): void {
  cron.schedule('0 * * * *', () => {
    runHeartbeat()
  }) // отправка в 00 минут каджый час (07:00, 08:00 и тд)

  cron.schedule('0 22 * * *', () => {
    runSync()
  }) // каждый день в 22:00

  cron.schedule('30 23 * * *', () => {
    runSync()
  }) // повторный sync для проверки, если были ошибки при первом, то контент догружается

  logger.info('Scheduler initialized')
}
