import { redis } from '../lib/redis'
import type { IntelligenceScoreJobData } from '../lib/queue'

export type IntelligenceEnqueueMeta = {
  packageName: string
  repoFullName: string
  triggeredBy?: string
}

// Simple list key — Python worker does BRPOP on this key.
// No BullMQ overhead: no events stream, no stalled checks, no meta keys.
export const INTEL_QUEUE_KEY = 'beacon:intel:queue'

/**
 * Push a scoring job directly to Redis as a plain JSON list entry.
 * Replaces BullMQ intelligenceQueue.add() to eliminate idle polling overhead.
 */
export async function enqueueIntelligenceScore(
  payload: IntelligenceScoreJobData,
  meta: IntelligenceEnqueueMeta
): Promise<string | undefined> {
  const jobId = `${Date.now()}-${payload.package_id}`
  await redis.lpush(INTEL_QUEUE_KEY, JSON.stringify({ id: jobId, data: payload }))

  console.log(JSON.stringify({
    event: 'intelligence_score_enqueued',
    jobId,
    packageId: payload.package_id,
    packageName: meta.packageName,
    triggeredBy: meta.triggeredBy ?? 'signal_collect',
    timestamp: new Date().toISOString(),
  }))

  return jobId
}
