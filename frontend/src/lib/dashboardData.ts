import type { Package } from '@/types'
import { packages, alerts, repos } from '@/lib/mockData'
import { daysSinceDate } from '@/lib/utils'

export const MONITORED_PACKAGE_COUNT = 340

export const PACKAGE_AI_REASONS: Record<string, string> = {
  'left-pad':
    'Last commit 1,550 days ago. No maintainer activity detected. Zero sponsor funding.',
  moment:
    'Maintainer has publicly stated the project is in maintenance-only mode. 195 days since last release.',
  request:
    'Officially deprecated by maintainer. No successor nominated. 992 days dormant.',
  bower:
    'Project formally deprecated. Maintainer recommends migrating to webpack or Vite.',
  'node-sass':
    'Native bindings unmaintained. sass package is the official successor.',
}

export const PACKAGE_RISK_PILLS: Record<string, string[]> = {
  'left-pad': ['No commits 1550d', '0 sponsors', 'Unmaintained'],
  moment: ['No commits 195d', '0 sponsors', 'Deprecated'],
  request: ['Deprecated', '992d dormant', '0 sponsors'],
  bower: ['Deprecated', 'Migrate to Vite', 'No funding'],
  'node-sass': ['Unmaintained', 'Use sass', 'Native bindings'],
}

export const PACKAGE_MAINTAINERS: Record<string, string> = {
  moment: '@momentjs',
  request: '@request',
  'left-pad': '@stevema',
  rxjs: '@ReactiveX',
  'node-sass': '@sass',
  bower: '@bower',
  underscore: '@jashkenas',
  nodemailer: '@nodemailer',
  gulp: '@gulpjs',
  passport: '@jaredhanson',
  lodash: '@lodash',
  express: '@expressjs',
  axios: '@axios',
  react: '@facebook',
  webpack: '@webpack',
  typescript: '@microsoft',
}

const DEFAULT_MAINTAINER = '@maintainer'

export function getMaintainerHandle(pkg: Package): string {
  const login = pkg.signalFacts?.primaryMaintainerLogin ?? pkg.maintainers?.[0]?.login
  if (login) return `@${login}`
  return PACKAGE_MAINTAINERS[pkg.id] ?? DEFAULT_MAINTAINER
}

export function getAiReason(pkg: Package): string {
  const facts = pkg.signalFacts
  if (facts) {
    const parts: string[] = []
    if (facts.daysSinceLastCommit > 90) {
      parts.push(`Last commit ${facts.daysSinceLastCommit}d ago`)
    }
    if (facts.sponsorCount === 0 && !facts.hasFundingYml) {
      parts.push('No sponsor funding')
    }
    if (facts.commitsLast30d === 0) {
      parts.push('Zero commits in 30d')
    }
    if (parts.length > 0) {
      return parts.join('. ') + '.'
    }
  }
  return (
    PACKAGE_AI_REASONS[pkg.id] ??
    `SPS at ${pkg.sps} with declining maintainer signals across ${pkg.repoName}.`
  )
}

export function getRiskPills(pkg: Package): string[] {
  if (PACKAGE_RISK_PILLS[pkg.id]) return PACKAGE_RISK_PILLS[pkg.id]
  const pills: string[] = []
  const facts = pkg.signalFacts
  if (facts) {
    if (facts.daysSinceLastCommit > 180) pills.push(`No commits ${facts.daysSinceLastCommit}d`)
    else if (facts.commitsLast30d === 0) pills.push('No commits 30d')
    if (facts.sponsorCount === 0 && !facts.hasFundingYml) pills.push('No sponsors')
    if (facts.contributorCount <= 1) pills.push('Single maintainer')
    if (facts.forkStarRatio > 0.25) pills.push('High fork ratio')
    if (facts.staleIssuePct > 50) pills.push('Stale issues')
  } else {
    if (pkg.signals.commitVelocity.value < 30) pills.push('Low commits')
    if (pkg.signals.funding.value < 20) pills.push('No sponsors')
    if (pkg.signals.communityHealth.trend === 'down') pills.push('Community decline')
  }
  return pills.slice(0, 3)
}

export function getTopRiskPackages(limit = 5): Package[] {
  return [...packages].sort((a, b) => a.sps - b.sps).slice(0, limit)
}

export function getHealthyPercentage(): number {
  const healthy = packages.filter(p => p.tier === 'healthy').length
  return Math.round((healthy / packages.length) * 100)
}

export function getHealthyRingColor(pct: number): string {
  if (pct > 80) return 'rgba(53, 133, 142, 0.85)'
  if (pct >= 60) return 'rgba(196, 120, 32, 0.75)'
  return 'rgba(192, 48, 48, 0.75)'
}

export function getStackAvgSpsTrend14(): { day: number; avg: number }[] {
  const len = 14
  return Array.from({ length: len }, (_, i) => {
    const dayIndex = packages[0].spsHistory.length - len + i
    const avg =
      packages.reduce((sum, p) => sum + (p.spsHistory[dayIndex] ?? 0), 0) / packages.length
    return { day: i, avg: Math.round(avg * 10) / 10 }
  })
}

export function getAiSummaryStats() {
  const critical = packages.filter(p => p.tier === 'critical').length
  const crossedRisk = alerts.filter(
    a => a.tier === 'at-risk' || a.tier === 'critical'
  ).length
  return { critical, crossedRisk }
}

/** Maintainer activity heatmap: 7 rows (Sun–Sat) × 12 weeks — static mock */
export const HEATMAP_GRID: number[][] = [
  [0, 0, 1, 0, 0, 0, 2, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2, 0],
  [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0],
  [0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

export const SPONSOR_NO_FUNDING_COUNT = 8
export const SPONSOR_TOTAL_TRACKED = 20
export const SPONSOR_LOST_RECENT = ['moment', 'request', 'bower']

export const PREDICTED_RISK = [
  { id: 'rxjs', name: 'rxjs', days: 18 },
  { id: 'underscore', name: 'underscore', days: 34 },
  { id: 'nodemailer', name: 'nodemailer', days: 61 },
] as const

export type MaintainerActivity = 'active' | 'stale' | 'dormant'

export function getMaintainerActivity(iso: string): MaintainerActivity {
  const days = daysSinceDate(iso)
  if (days < 30) return 'active'
  if (days < 180) return 'stale'
  return 'dormant'
}

export const MAINTAINER_DOT_CLASS: Record<MaintainerActivity, string> = {
  active: 'bg-dl-healthy',
  stale: 'bg-dl-warning',
  dormant: 'bg-dl-critical',
}

export type SignalLevel = 'good' | 'degraded' | 'bad'

export function getSignalLevel(value: number, trend: 'up' | 'down' | 'stable'): SignalLevel {
  if (value >= 60 && trend !== 'down') return 'good'
  if (value >= 30) return 'degraded'
  return 'bad'
}

export const SIGNAL_LEVEL_CLASS: Record<SignalLevel, string> = {
  good: 'text-dl-healthy',
  degraded: 'text-dl-warning',
  bad: 'text-dl-critical',
}

export function formatLastUpdatedLabel(iso: string): string {
  const days = daysSinceDate(iso)
  if (days < 90) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  const years = Math.floor(days / 365)
  return `${years}y ago`
}

export function getLastUpdatedColorClass(iso: string): string {
  const days = daysSinceDate(iso)
  if (days < 90) return 'text-dl-healthy'
  if (days < 365) return 'text-dl-warning'
  return 'text-dl-critical'
}

export { packages, alerts, repos }
