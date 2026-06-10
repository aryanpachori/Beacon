'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Repo, Tier } from '@/types'
import { TierChip } from '@/components/ui/TierChip'
import { SPSBadge } from '@/components/ui/SPSBadge'
import { tierColor } from '@/lib/constants'
import {
  getAiHealthSummary,
  getLastScannedLabel,
  getTierBreakdown,
  getCriticalCount,
  getAtRiskCount,
  getTopRisks,
  getAvgSpsColorClass,
  getTierBarFillClass,
  TIER_BREAKDOWN_LABELS,
} from '@/lib/reposData'
import { cn } from '@/lib/utils'

import { triggerRepoRescan } from '@/lib/api'

interface RepoCardProps {
  repo: Repo
  onRescan?: () => Promise<void>
}

const TIER_DOT_CLASS: Record<Tier, string> = {
  critical: 'bg-dl-critical',
  'at-risk': 'bg-dl-risk',
  watch: 'bg-dl-watch',
  healthy: 'bg-dl-healthy',
}

export function RepoCard({ repo, onRescan }: RepoCardProps) {
  const [scanning, setScanning] = useState(false)
  const criticalCount = getCriticalCount(repo)
  const atRiskCount = getAtRiskCount(repo)
  const breakdown = getTierBreakdown(repo)
  const topRisks = getTopRisks(repo)
  const avgSpsColor = getAvgSpsColorClass(repo)

  const handleScan = async () => {
    if (scanning) return
    setScanning(true)
    try {
      await triggerRepoRescan()
      await onRescan?.()
    } finally {
      window.setTimeout(() => setScanning(false), 1500)
    }
  }

  return (
    <motion.article
      className={cn(
        'repo-card dash-card overflow-hidden transition-colors',
        scanning && 'border-dl-teal'
      )}
      animate={
        scanning
          ? {
              boxShadow: [
                '0 0 0 0 rgba(53, 133, 142, 0)',
                '0 0 0 3px rgba(53, 133, 142, 0.35)',
                '0 0 0 0 rgba(53, 133, 142, 0)',
              ],
            }
          : { boxShadow: '0 0 0 0 rgba(53, 133, 142, 0)' }
      }
      transition={scanning ? { duration: 0.65, repeat: 2, ease: 'easeInOut' } : { duration: 0.2 }}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-mono text-[16px] font-medium text-dl-forest">{repo.name}</span>
            <span className="font-mono text-[12px] text-dl-hint">{repo.org}</span>
            <span className="ml-auto text-[11px] text-dl-hint">{getLastScannedLabel(repo)}</span>
          </div>

          <div className="mb-4 flex gap-2">
            <Sparkles className="mt-0.5 h-[13px] w-[13px] shrink-0 text-dl-teal" aria-hidden />
            <p className="text-[12px] leading-relaxed text-dl-muted">{getAiHealthSummary(repo)}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="stat-tile repo-stat-tile">
              <p className="text-[10px] uppercase tracking-wider text-dl-muted">Packages</p>
              <p className="mt-1 text-[20px] font-medium text-dl-forest">{repo.packageCount}</p>
            </div>
            <div className="stat-tile repo-stat-tile">
              <p className="text-[10px] uppercase tracking-wider text-dl-muted">Avg SPS</p>
              <p className={cn('mt-1 text-[20px] font-medium tabular-nums', avgSpsColor)}>
                {repo.avgSps}
              </p>
            </div>
            <div className="stat-tile repo-stat-tile">
              <p className="text-[10px] uppercase tracking-wider text-dl-muted">Critical</p>
              <p
                className={cn(
                  'mt-1 text-[20px] font-medium tabular-nums',
                  criticalCount > 0 ? 'text-dl-critical' : 'text-dl-forest'
                )}
              >
                {criticalCount}
              </p>
            </div>
            <div className="stat-tile repo-stat-tile">
              <p className="text-[10px] uppercase tracking-wider text-dl-muted">At risk</p>
              <p
                className={cn(
                  'mt-1 text-[20px] font-medium tabular-nums',
                  atRiskCount > 0 ? 'text-dl-risk' : 'text-dl-forest'
                )}
              >
                {atRiskCount}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 overflow-x-auto whitespace-nowrap">
            <span className="shrink-0 text-[11px] text-dl-muted">Highest risk</span>
            <span className="shrink-0 text-[13px] font-medium text-dl-forest">
              {repo.worstPackage.name}
            </span>
            <span className="shrink-0">
              <TierChip tier={repo.worstPackage.tier} />
            </span>
            <span className="shrink-0">
              <SPSBadge score={repo.worstPackage.sps} tier={repo.worstPackage.tier} size="sm" />
            </span>
            <Link
              href={`/packages/${repo.worstPackage.name}`}
              className="shrink-0 text-[12px] font-medium text-dl-teal hover:underline"
            >
              View →
            </Link>
          </div>
        </div>

        <div className="min-w-0 lg:pt-0">
          <p className="dash-section-label mb-3">Package health breakdown</p>
          <div className="space-y-2.5">
            {breakdown.map(row => (
              <div key={row.tier} className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-[11px] text-dl-muted">
                  {TIER_BREAKDOWN_LABELS[row.tier]}
                </span>
                <div className="tier-bar-track">
                  <div
                    className={getTierBarFillClass(row.tier)}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-[11px] tabular-nums text-dl-hint">
                  {row.count}
                </span>
              </div>
            ))}
          </div>

          <p className="dash-section-label mb-2 mt-4">Top risks</p>
          <ul className="mb-4 space-y-2">
            {topRisks.map(risk => (
              <li key={risk.id}>
                <Link
                  href={`/packages/${risk.id}`}
                  className="flex items-center gap-2.5 rounded-lg px-1 py-1 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                >
                  <span
                    className={cn('h-1.5 w-1.5 shrink-0 rounded-full', TIER_DOT_CLASS[risk.tier])}
                    aria-hidden
                  />
                  <span className="w-[72px] shrink-0 truncate text-[13px] text-dl-forest">
                    {risk.name}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[11px] text-dl-hint">
                    {risk.riskPill}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 text-right text-[13px] font-medium tabular-nums',
                      tierColor(risk.tier, 'text')
                    )}
                  >
                    {risk.sps}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="repo-scan-btn"
            onClick={handleScan}
            disabled={scanning}
          >
            {scanning ? 'Scanning…' : 'Scan now'}
          </button>
        </div>
      </div>
    </motion.article>
  )
}
