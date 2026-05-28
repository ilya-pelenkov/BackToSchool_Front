import cron from 'node-cron'

import { runHeartbeat } from './heartbeat'
import logger from './logger'

export function initScheduler(): void {
  cron.schedule('0 * * * *', () => {
    runHeartbeat()
  }) // отправка в 00 минут каджый час (07:00, 08:00 и тд)

  // cron.schedule('0 7 * * *', () => {
  //   syncContent()
  // })

  logger.info('Scheduler initialized')
}
