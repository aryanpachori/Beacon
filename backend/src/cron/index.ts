import cron from 'node-cron'
import { runDailyScan } from './dailyScan.cron'
import { runCriticalScan } from './criticalScan.cron'
import { runDigest } from './digest.cron'
import { runPublicDigest } from './publicDigest.cron'
import { runAdvisoryCheck } from './advisory.cron'

export function startCrons(): void {
  cron.schedule('0 2 * * *', runDailyScan, { timezone: 'UTC' })
  cron.schedule('0 */6 * * *', runCriticalScan, { timezone: 'UTC' })
  cron.schedule('0 8 * * *', runDigest, { timezone: 'UTC' })
  cron.schedule('0 9 * * 1', runPublicDigest, { timezone: 'UTC' })
  cron.schedule('*/30 * * * *', runAdvisoryCheck)

  console.log('Crons registered')
}
