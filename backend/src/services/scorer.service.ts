import type { IntelligenceSignalsPayload } from '../lib/queue'

const FEATURE_ORDER = [
  'commit_velocity',
  'maintainer_activity',
  'security_hygiene',
  'issue_resolution',
  'funding',
  'community_health',
] as const satisfies ReadonlyArray<keyof IntelligenceSignalsPayload>

const HEURISTIC_WEIGHTS: Record<(typeof FEATURE_ORDER)[number], number> = {
  commit_velocity: 0.2,
  maintainer_activity: 0.22,
  security_hygiene: 0.22,
  issue_resolution: 0.16,
  funding: 0.08,
  community_health: 0.12,
}

const SIGNAL_LABELS: Record<(typeof FEATURE_ORDER)[number], string> = {
  commit_velocity: 'Commit velocity',
  maintainer_activity: 'Maintainer activity',
  security_hygiene: 'Security hygiene',
  issue_resolution: 'Issue resolution',
  funding: 'Funding',
  community_health: 'Community health',
}

const DEPRECATED_SECURITY_THRESHOLD = 15
const DEPRECATED_SPS_CAP = 30

export function assignTier(sps: number): string {
  if (sps < 20) return 'critical'
  if (sps < 50) return 'at-risk'
  if (sps < 80) return 'watch'
  return 'healthy'
}

function isDeprecated(signals: IntelligenceSignalsPayload): boolean {
  return signals.security_hygiene <= DEPRECATED_SECURITY_THRESHOLD
}

function applyDeprecatedCap(sps: number, signals: IntelligenceSignalsPayload): number {
  if (isDeprecated(signals)) {
    return Math.min(sps, DEPRECATED_SPS_CAP)
  }
  return sps
}

function generateReason(signals: IntelligenceSignalsPayload): string {
  if (FEATURE_ORDER.every((key) => signals[key] === 0)) {
    return 'Insufficient signal data to generate a prediction.'
  }

  if (isDeprecated(signals)) {
    return (
      'Package is deprecated on the npm registry — the maintainer has marked it ' +
      'as no longer supported.'
    )
  }

  const weakestKey = FEATURE_ORDER.reduce((min, key) =>
    signals[key] < signals[min] ? key : min
  )
  const weakestValue = signals[weakestKey]
  const label = SIGNAL_LABELS[weakestKey]
  const severity =
    weakestValue < 20 ? 'critically low' : weakestValue < 50 ? 'low' : 'below average'

  return (
    `${label} scored ${weakestValue.toFixed(0)}/100 (${severity}), ` +
    'making it the primary risk driver for this package.'
  )
}

export function scorePackage(signals: IntelligenceSignalsPayload): {
  sps: number
  tier: string
  predictionReason: string
} {
  const health =
    FEATURE_ORDER.reduce((sum, key) => sum + HEURISTIC_WEIGHTS[key] * signals[key], 0) / 100

  const sps = applyDeprecatedCap(Math.round(health * 100), signals)
  const tier = assignTier(sps)
  const predictionReason = generateReason(signals)

  console.log(
    JSON.stringify({
      event: 'package_scored',
      method: 'heuristic',
      sps,
      deprecated: isDeprecated(signals),
      timestamp: new Date().toISOString(),
    })
  )

  return { sps, tier, predictionReason }
}
