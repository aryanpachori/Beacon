import {
  intelligenceQueue,
  IntelligenceJobName,
  IntelligenceScoreJobData,
  Queues,
} from '../lib/queue'

export type IntelligenceEnqueueMeta = {
  packageName: string
  repoFullName: string
  triggeredBy?: string
}

/** Push a score job onto the BullMQ `intelligence-score` queue (stored in Redis). */
export async function enqueueIntelligenceScore(
  payload: IntelligenceScoreJobData,
  meta: IntelligenceEnqueueMeta
): Promise<string | undefined> {
  const job = await intelligenceQueue.add(IntelligenceJobName.SCORE, payload)

  console.log(
    JSON.stringify({
      event: 'intelligence_score_enqueued',
      queue: Queues.INTELLIGENCE_SCORE,
      jobId: job.id,
      jobName: IntelligenceJobName.SCORE,
      packageId: payload.package_id,
      packageName: meta.packageName,
      repo: meta.repoFullName,
      installationId: payload.installation_id,
      installationGithubId: payload.installation_github_id,
      prevSps: payload.prev_sps,
      signals: payload.signals,
      triggeredBy: meta.triggeredBy ?? 'signal_collect',
      timestamp: new Date().toISOString(),
    })
  )

  return job.id
}
