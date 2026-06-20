import { IntelligenceScoreJobData } from '../lib/queue'
import { incrementScanScored } from './alert.service'
import { assignTier, scorePackage } from './scorer.service'

export type IntelligenceEnqueueMeta = {
  packageName: string
  repoFullName: string
  triggeredBy?: string
}

/**
 * Score a package directly in-process — no Redis queue.
 * Previously enqueued to BullMQ intelligence-score; now inline to eliminate
 * ~80 Redis commands per package (the main cause of Upstash quota exhaustion).
 *
 * If PY_INTELLIGENCE_URL is set, POSTs to py-intelligence HTTP endpoint instead
 * and returns immediately (py-intelligence calls back via /api/internal/score-complete).
 */
export async function enqueueIntelligenceScore(
  payload: IntelligenceScoreJobData,
  meta: IntelligenceEnqueueMeta
): Promise<string | undefined> {
  const pyUrl = process.env.PY_INTELLIGENCE_URL

  // ── Path A: py-intelligence HTTP (separate server) ────────────────────────
  if (pyUrl) {
    const secret = process.env.INTERNAL_WEBHOOK_SECRET ?? ''
    try {
      await fetch(`${pyUrl}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-secret': secret },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      })
      console.log(JSON.stringify({
        event: 'intelligence_score_dispatched',
        mode: 'http',
        packageId: payload.package_id,
        packageName: meta.packageName,
        triggeredBy: meta.triggeredBy ?? 'signal_collect',
        timestamp: new Date().toISOString(),
      }))
    } catch (err) {
      console.warn(`py-intelligence HTTP failed, falling back to inline scoring: ${(err as Error).message}`)
      await scoreInline(payload, meta)
    }
    return undefined
  }

  // ── Path B: inline Node.js heuristic scoring (default) ───────────────────
  await scoreInline(payload, meta)
  return undefined
}

async function scoreInline(payload: IntelligenceScoreJobData, meta: IntelligenceEnqueueMeta): Promise<void> {
  const { sps, tier, predictionReason } = scorePackage(payload.signals)
  const prevTier = payload.prev_sps !== null ? assignTier(payload.prev_sps) : null

  console.log(JSON.stringify({
    event: 'intelligence_score_inline',
    packageId: payload.package_id,
    packageName: meta.packageName,
    newSps: sps,
    tier,
    timestamp: new Date().toISOString(),
  }))

  await incrementScanScored(
    payload.installation_id,
    payload.package_id,
    sps,
    tier,
    payload.prev_sps,
    prevTier,
    predictionReason,
    { ...payload.signals },
    payload.is_advisory,
    payload.cve_id,
  )
}
