import type { Package, Repo, Tier } from '@/types'
import { packages } from '@/lib/mockData'
import { getRiskPills } from '@/lib/dashboardData'
import { spsToTier, tierColor } from '@/lib/constants'
import { daysSinceDate } from '@/lib/utils'

export function getRepoPackages(repo: Repo, allPackages?: Package[]): Package[] {
  const full = getRepoFullName(repo)
  if (allPackages?.length) {
    return allPackages.filter(p => p.repoName === full)
  }
  return packages.filter(p => p.repoName === full)
}

function countTiersFromPackages(pkgs: Package[]): Record<Tier, number> {
  const counts: Record<Tier, number> = {
    critical: 0,
    'at-risk': 0,
    watch: 0,
    healthy: 0,
  }
  for (const pkg of pkgs) {
    if (pkg.scoringPending) continue
    counts[pkg.tier] += 1
  }
  return counts
}

export interface TierBreakdown {
  tier: Tier
  count: number
  pct: number
}

export interface RepoTopRisk {
  id: string
  name: string
  sps: number
  tier: Tier
  riskPill: string
}

const AI_SUMMARIES: Record<string, string> = {
  'repo-frontend':
    '2 of 142 packages are in critical state. moment and lodash account for 60% of the overall risk score.',
  'repo-api':
    'Generally healthy stack. request is the only critical package and has a clear successor (node-fetch).',
  'repo-legacy':
    'High-risk repo. 38% of packages have not been updated in over 2 years. Immediate audit recommended.',
}

/** Tier counts that sum to each repo's packageCount (mock distribution). */
const TIER_COUNTS: Record<string, Record<Tier, number>> = {
  'repo-frontend': { critical: 2, 'at-risk': 11, watch: 28, healthy: 101 },
  'repo-api': { critical: 1, 'at-risk': 5, watch: 12, healthy: 69 },
  'repo-legacy': { critical: 1, 'at-risk': 14, watch: 8, healthy: 15 },
}

const TOP_RISK_OVERRIDES: Record<string, string[]> = {
  'repo-frontend': ['moment', 'lodash', 'rxjs'],
  'repo-api': ['request', 'passport', 'nodemailer'],
  'repo-legacy': ['bower', 'left-pad', 'gulp'],
}

const LAST_SCANNED_DAYS: Record<string, number> = {
  'repo-frontend': 80,
  'repo-api': 12,
  'repo-legacy': 45,
}

export function getRepoFullName(repo: Repo): string {
  return `${repo.org}/${repo.name}`
}

export function getAiHealthSummary(repo: Repo): string {
  return (
    AI_SUMMARIES[repo.id] ??
    `${repo.packageCount} packages monitored. Worst health signal: ${repo.worstPackage.name} at SPS ${repo.worstPackage.sps}.`
  )
}

export function getLastScannedLabel(repo: Repo): string {
  const days = LAST_SCANNED_DAYS[repo.id] ?? daysSinceDate(repo.connectedAt)
  return `Last scanned ${days}d ago`
}

export function getTierBreakdown(repo: Repo, allPackages?: Package[]): TierBreakdown[] {
  const livePackages = getRepoPackages(repo, allPackages)
  const counts =
    livePackages.length > 0
      ? countTiersFromPackages(livePackages)
      : TIER_COUNTS[repo.id] ?? inferTierCounts(repo)
  const total = repo.packageCount
  const order: Tier[] = ['critical', 'at-risk', 'watch', 'healthy']

  return order.map(tier => {
    const count = counts[tier] ?? 0
    return {
      tier,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }
  })
}

function inferTierCounts(repo: Repo): Record<Tier, number> {
  const full = getRepoFullName(repo)
  const inRepo = packages.filter(p => p.repoName === full)
  const counts: Record<Tier, number> = {
    critical: 0,
    'at-risk': 0,
    watch: 0,
    healthy: 0,
  }
  inRepo.forEach(p => {
    counts[p.tier] += 1
  })
  return counts
}

export function getCriticalCount(repo: Repo, allPackages?: Package[]): number {
  return getTierBreakdown(repo, allPackages).find(b => b.tier === 'critical')?.count ?? 0
}

export function getAtRiskCount(repo: Repo, allPackages?: Package[]): number {
  return getTierBreakdown(repo, allPackages).find(b => b.tier === 'at-risk')?.count ?? 0
}

export function getTopRisks(repo: Repo, allPackages?: Package[]): RepoTopRisk[] {
  const overrideIds = TOP_RISK_OVERRIDES[repo.id]
  const livePackages = getRepoPackages(repo, allPackages)

  const pool = overrideIds
    ? overrideIds
        .map(id => packages.find(p => p.id === id))
        .filter((p): p is (typeof packages)[0] => Boolean(p))
    : livePackages.length > 0
      ? [...livePackages]
          .filter(p => !p.scoringPending)
          .sort((a, b) => a.sps - b.sps)
      : packages
          .filter(p => p.repoName === getRepoFullName(repo))
          .sort((a, b) => a.sps - b.sps)

  const risks = pool.slice(0, 3).map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    sps: pkg.sps,
    tier: pkg.tier,
    riskPill: getRiskPills(pkg)[0] ?? 'Elevated risk',
  }))

  if (risks.length === 0 && repo.worstPackage.name !== '—') {
    return [
      {
        id: repo.worstPackage.name,
        name: repo.worstPackage.name,
        sps: repo.worstPackage.sps,
        tier: repo.worstPackage.tier,
        riskPill: 'Lowest SPS in repo',
      },
    ]
  }

  return risks
}

export function getAvgSpsColorClass(repo: Repo): string {
  return tierColor(spsToTier(repo.avgSps), 'text')
}

const TIER_BAR_FILL: Record<Tier, string> = {
  critical: 'tier-bar-fill-critical',
  'at-risk': 'tier-bar-fill-at-risk',
  watch: 'tier-bar-fill-watch',
  healthy: 'tier-bar-fill-healthy',
}

export function getTierBarFillClass(tier: Tier): string {
  return TIER_BAR_FILL[tier]
}

export const TIER_BREAKDOWN_LABELS: Record<Tier, string> = {
  critical: 'Critical',
  'at-risk': 'At risk',
  watch: 'Watch',
  healthy: 'Healthy',
}
