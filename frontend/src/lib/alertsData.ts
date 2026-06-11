import type { Alert } from '@/types'
import { alerts } from '@/lib/mockData'
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
  if (alert.aiReason) return alert.aiReason
  if (AI_REASONS[alert.id]) return AI_REASONS[alert.id]

  return `SPS changed from ${alert.spsBefore} to ${alert.spsAfter} for ${alert.packageName}.`
}

export function getAlertSignalPills(alert: Alert): string[] {
  if (alert.signalPills && alert.signalPills.length > 0) {
    return alert.signalPills.slice(0, 3)
  }
  if (SIGNAL_PILLS[alert.id]) return SIGNAL_PILLS[alert.id].slice(0, 3)
  return ['Health decline', 'Tier change']
}

export function getTierChangeLabel(alert: Alert): string {
  if (alert.alertType === 'supply_chain') {
    return 'Security Advisory / CVE Override Alert'
  }
  const before = TIER_LABELS[spsToTier(alert.spsBefore)]
  const after = TIER_LABELS[alert.tier]
  return `${before} → ${after}`
}

/** Rolling 7-day window from alert firedAt timestamps. */
export function getWeeklySummary(alertList: Alert[] = alerts) {
  const weekAgo = Date.now() - 7 * 86_400_000
  const week = alertList.filter(a => new Date(a.firedAt).getTime() >= weekAgo)
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
