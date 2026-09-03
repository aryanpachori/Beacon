import cron from 'node-cron'
import { runDailyScan } from './dailyScan.cron'
import { runCriticalScan } from './criticalScan.cron'
import { runDigest } from './digest.cron'
import { runPublicDigest } from './publicDigest.cron'
import { runAdvisoryCheck } from './advisory.cron'
import { runInfraDriftCheck } from './infraDrift.cron'

export function startCrons(): void {
  cron.schedule('0 2 * * *', runDailyScan,     { timezone: 'UTC' }) // daily at 02:00
  cron.schedule('0 4 * * *', runCriticalScan,  { timezone: 'UTC' }) // daily at 04:00 (was every 6h)
  cron.schedule('0 * * * *', runDigest,        { timezone: 'UTC' }) // hourly; digest.cron filters by digestHour
  cron.schedule('0 9 * * 1', runPublicDigest,  { timezone: 'UTC' }) // weekly Monday 09:00
  cron.schedule('0 6 * * *', runAdvisoryCheck, { timezone: 'UTC' }) // daily at 06:00 (was every 30 min)

  // BE-2 infra drift — no-ops unless BEACON_INFRA_BASELINE + BEACON_INFRA_SCAN_PATHS are set
  cron.schedule('30 5 * * *', () => {
    void runInfraDriftCheck()
  }, { timezone: 'UTC' })

  console.log('Crons registered')
}
