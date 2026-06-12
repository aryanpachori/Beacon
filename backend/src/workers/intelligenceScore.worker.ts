import { Worker, Job } from 'bullmq'
import { queueConnection, Queues, IntelligenceScoreJobData } from '../lib/queue'
import { incrementScanScored } from '../services/alert.service'
import { assignTier, scorePackage } from '../services/scorer.service'

export function startIntelligenceWorker(): void {
  const worker = new Worker<IntelligenceScoreJobData>(
    Queues.INTELLIGENCE_SCORE,
    async (job: Job<IntelligenceScoreJobData>) => {
      const { package_id, installation_id, prev_sps, signals } = job.data

      console.log(
        JSON.stringify({
          event: 'scoring_started',
          jobId: job.id,
          packageId: package_id,
          prevSps: prev_sps,
          timestamp: new Date().toISOString(),
        })
      )

      const { sps, tier, predictionReason } = scorePackage(signals)
      const prevTier = prev_sps !== null ? assignTier(prev_sps) : null

      await incrementScanScored(
        installation_id,
        package_id,
        sps,
        tier,
        prev_sps,
        prevTier,
        predictionReason,
        { ...signals }
      )

      console.log(
        JSON.stringify({
          event: 'scoring_complete',
          jobId: job.id,
          packageId: package_id,
          newSps: sps,
          tier,
          timestamp: new Date().toISOString(),
        })
      )
    },
    { connection: queueConnection, concurrency: 5 }
  )

  worker.on('failed', (job, err) => {
    console.error(`intelligence-score job ${job?.id} failed:`, err.message)
  })

  console.log('Intelligence score worker started (Node heuristic)')
}
