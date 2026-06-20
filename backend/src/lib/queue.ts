import { Queue } from 'bullmq'
import type { NormalizedSignals } from '../services/signals.service'
import { getRedisConnectionOptions } from './redisConnection'

export const Queues = {
  SIGNAL_COLLECT: 'signal-collect',
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

/** Pushed by API (callback, webhooks, crons). Consumed by Node signal worker (in-process). */
export interface SignalCollectJobData {
  installation_id: number
  installationDbId?: string
  userId?: string
  repos?: Array<{ owner: string; repo: string; manifestPaths?: string[] }>
  triggered_by?: string
  packageId?: string
  cveId?: string
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

/** Pushed by Node after signal collection. Consumed by py-intelligence worker via Redis. */
export interface IntelligenceScoreJobData {
  package_id: string
  installation_id: string
  installation_github_id: number
  prev_sps: number | null
  signals: IntelligenceSignalsPayload
  is_advisory?: boolean
  cve_id?: string
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

const queueConnection = {
  ...getRedisConnectionOptions(),
  maxRetriesPerRequest: null,
}

/**
 * Intelligence-score queue — only BullMQ queue still in use.
 * signal-collect was replaced by in-process queue (lib/scanQueue.ts), so that
 * Queue object is removed entirely to stop idle Redis heartbeats for it.
 *
 * Tuned to minimise Redis commands:
 * - streams.events.maxLen:0  → disables the events stream (no XADD/XTRIM per job)
 * - stalledInterval:0        → disables stalled-job heartbeat (no SET every ~1s)
 * - removeOnComplete/Fail    → no job retention, no scan overhead
 */
export const intelligenceQueue = new Queue<IntelligenceScoreJobData>(Queues.INTELLIGENCE_SCORE, {
  connection: queueConnection,
  streams: { events: { maxLen: 0 } },
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: { count: 0 },
    removeOnFail: { count: 0 },
  },
})
