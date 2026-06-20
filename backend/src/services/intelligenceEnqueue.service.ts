import { IntelligenceScoreJobData, intelligenceQueue, IntelligenceJobName } from '../lib/queue'

export type IntelligenceEnqueueMeta = {
  packageName: string
  repoFullName: string
  triggeredBy?: string
}

/**
 * Push a scoring job to the BullMQ intelligence-score queue.
 * py-intelligence worker consumes from this queue via Redis and POSTs results
 * back to /api/internal/score-complete.
 */
export async function enqueueIntelligenceScore(
  payload: IntelligenceScoreJobData,
  meta: IntelligenceEnqueueMeta
): Promise<string | undefined> {
  const job = await intelligenceQueue.add(IntelligenceJobName.SCORE, payload, {
    attempts: 1,
    removeOnComplete: { count: 0 },
    removeOnFail: { count: 0 },
  })

  console.log(JSON.stringify({
    event: 'intelligence_score_enqueued',
    jobId: job.id,
    packageId: payload.package_id,
    packageName: meta.packageName,
    triggeredBy: meta.triggeredBy ?? 'signal_collect',
    timestamp: new Date().toISOString(),
  }))

  return job.id
}
