import type { Alert } from '@/types'
import { alerts, packages } from '@/lib/mockData'
import { spsToTier, TIER_LABELS } from '@/lib/constants'

const AI_REASONS: Record<string, string> = {
  'alert-1':
    'Commit frequency dropped 80% over 30 days. Maintainer account shows no activity on GitHub since October.',
  'alert-2':
    'Package marked deprecated with no security patch cadence. Downstream repos still receive transitive installs.',
  'alert-3':
    'Issue backlog grew 40% while release cadence slowed. Community fork activity exceeded mainline contributions.',
  'alert-4':
    'Native bindings failed on latest Node LTS with no maintainer response. Build pipelines blocking on this dependency.',
  'alert-5':
    'Registry metadata confirms official deprecation. Zero commits in 180+ days across all tracked branches.',
  'alert-6':
    'OpenCollective funding reached $0. Last corporate sponsor withdrew 47 days ago.',
  'alert-7':
    'Repository archived by maintainer. SPS collapsed after npm deprecation advisory propagated.',
  'alert-8':
    'Security hygiene score fell below watch threshold. Maintainer response time on CVE reports exceeds 45 days.',
}

const SIGNAL_PILLS: Record<string, string[]> = {
  'alert-1': ['No commits 195d', 'Maintainer inactive', 'No sponsors'],
  'alert-2': ['Deprecated', 'CVE exposure', 'Zero funding'],
  'alert-3': ['Slow releases', 'Issue backlog', 'Fork divergence'],
  'alert-4': ['Binding failures', 'Node LTS risk', 'Low SPS'],
  'alert-5': ['Deprecated', '180d+ idle', 'Legacy stack'],
  'alert-6': ['Funding $0', 'Sponsor withdrawn', 'At-risk tier'],
  'alert-7': ['Archived', 'Critical SPS', 'No maintenance'],
  'alert-8': ['CVE lag', 'Watch threshold', 'Security drop'],
}

export function isAlertResolved(alert: Alert): boolean {
  return alert.slackSent && alert.jiraCreated
}

export function isAlertUnread(alert: Alert): boolean {
  return !isAlertResolved(alert)
}

export function getUnreadCount(alertList: Alert[] = alerts): number {
  return alertList.filter(isAlertUnread).length
}

export function getAlertAiReason(alert: Alert): string {
  if (AI_REASONS[alert.id]) return AI_REASONS[alert.id]

  const pkg = packages.find(p => p.id === alert.packageId)
  if (!pkg) {
    return `SPS dropped from ${alert.spsBefore} to ${alert.spsAfter} after sustained negative signals across maintenance and community health.`
  }

  const days = Math.round((100 - pkg.signals.commitVelocity.value) * 2)
  return `Commit velocity and funding signals deteriorated over the past ${days} days, pushing ${pkg.name} below your configured tier threshold.`
}

export function getAlertSignalPills(alert: Alert): string[] {
  if (SIGNAL_PILLS[alert.id]) return SIGNAL_PILLS[alert.id].slice(0, 3)

  const pkg = packages.find(p => p.id === alert.packageId)
  if (!pkg) return ['SPS drop', 'Tier change']

  const pills: string[] = []
  if (pkg.signals.commitVelocity.value < 30) pills.push('Low commits')
  if (pkg.signals.funding.value < 20) pills.push('No sponsors')
  if (pkg.signals.securityHygiene.value < 40) pills.push('Security risk')
  if (pills.length === 0) pills.push('Health decline')
  return pills.slice(0, 3)
}

export function getTierChangeLabel(alert: Alert): string {
  const before = TIER_LABELS[spsToTier(alert.spsBefore)]
  const after = TIER_LABELS[alert.tier]
  return `${before} → ${after}`
}

/** Rolling 7-day window — mock aligns with triage copy ("5 alerts this week"). */
const THIS_WEEK_IDS = new Set([
  'alert-1',
  'alert-2',
  'alert-3',
  'alert-4',
  'alert-5',
])

export function getWeeklySummary(alertList: Alert[] = alerts) {
  const week = alertList.filter(a => THIS_WEEK_IDS.has(a.id))
  const critical = week.filter(a => a.tier === 'critical').length
  const resolved = week.filter(isAlertResolved).length
  const drops = week.map(a => a.spsBefore - a.spsAfter)
  const avgDrop =
    drops.length > 0 ? Math.round(drops.reduce((s, d) => s + d, 0) / drops.length) : 0

  return {
    total: week.length,
    criticalFired: critical,
    resolved,
    avgSpsDrop: avgDrop,
  }
}

export const AI_TRIAGE = {
  body: '3 of your 5 alerts this week share a common root cause: packages with no active corporate sponsor that crossed the 180-day inactivity threshold. Consider auditing your full dependency tree for sponsor-free packages proactively.',
  sponsorFreeCount: 8,
}
