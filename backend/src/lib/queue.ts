import { Queue } from 'bullmq'
import type { NormalizedSignals } from '../services/signals.service'

/**
 * One Redis instance (REDIS_URL) backs everything:
 * - BullMQ queue 1: signal-collect  (Node worker consumes)
 * - BullMQ queue 2: intelligence-score (Python worker consumes)
 * - Signal cache, alert dedup, rate limits, JWT refresh (ioredis in lib/redis.ts)
 *
 * Queues are separated by BullMQ queue name — not separate Redis DBs.
 * See architecture doc: "The two queues — nothing more"
 */

export const Queues = {
  /** GitHub connect, webhooks, crons → manifest scan + signal collection */
  SIGNAL_COLLECT: 'signal-collect',
  /** After signals persisted → XGBoost scoring in Python service */
  INTELLIGENCE_SCORE: 'intelligence-score',
} as const

export const SignalCollectJobName = {
  SCAN: 'scan',
  DAILY_SCAN: 'daily-scan',
  CRITICAL_SCAN: 'critical-scan',
  ADVISORY_CHECK: 'advisory-check',
} as const

export const IntelligenceJobName = {
  SCORE: 'score',
} as const

/** Pushed by API (callback, webhooks, crons). Consumed by Node signal worker. */
export interface SignalCollectJobData {
  installation_id: number
  installationDbId?: string
  userId?: string
  repos?: Array<{ owner: string; repo: string; manifestPaths?: string[] }>
  triggered_by?: string
  /** Advisory cron: re-check a single package */
  packageId?: string
}

/** Six normalised scores for Python feature vector (0–100 each). */
export interface IntelligenceSignalsPayload {
  commit_velocity: number
  maintainer_activity: number
  funding: number
  issue_resolution: number
  community_health: number
  security_hygiene: number
}

/** Pushed by Node after signal collection. Consumed by Python intelligence worker. */
export interface IntelligenceScoreJobData {
  package_id: string
  installation_id: string
  installation_github_id: number
  prev_sps: number | null
  signals: IntelligenceSignalsPayload
}

export function toIntelligenceSignals(signals: NormalizedSignals): IntelligenceSignalsPayload {
  return {
    commit_velocity: signals.commitVelocity,
    maintainer_activity: signals.maintainerActivity,
    funding: signals.funding,
    issue_resolution: signals.issueResolution,
    community_health: signals.communityHealth,
    security_hygiene: signals.securityHygiene,
  }
}

function parseRedisConnection() {
  const url = new URL(process.env.REDIS_URL!)
  return {
    host: url.hostname,
    port: parseInt(url.port || '6379', 10),
    password: url.password || undefined,
  }
}

/** Shared BullMQ connection — both queues use the same Redis. */
export const queueConnection = parseRedisConnection()

export const signalCollectQueue = new Queue<SignalCollectJobData>(Queues.SIGNAL_COLLECT, {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
})

export const intelligenceQueue = new Queue<IntelligenceScoreJobData>(Queues.INTELLIGENCE_SCORE, {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
})
