'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GitBranch, RefreshCw, Sparkles, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Repo, Tier } from '@/types'
import { TierChip } from '@/components/ui/TierChip'
import { SPSBadge } from '@/components/ui/SPSBadge'
import { useAppData } from '@/context/AppDataContext'
import {
  getAiHealthSummary,
  getLastScannedLabel,
  getTierBreakdown,
  getCriticalCount,
  getAtRiskCount,
  getAvgSpsColorClass,
  getRepoFullName,
} from '@/lib/reposData'
import { cn } from '@/lib/utils'
import { triggerRepoRescan } from '@/lib/api'

interface RepoCardProps {
  repo: Repo
  onRescan?: () => Promise<void>
}

const TIER_CONFIG: Record<
  Tier,
  { label: string; color: string; bg: string; barClass: string }
> = {
  healthy: {
    label: 'Healthy',
    color: '#c2c4cb',
    bg: 'var(--dl-surface)',
    barClass: 'tier-bar-fill-healthy',
  },
  watch: {
    label: 'Watch',
    color: '#a3a6b0',
    bg: 'var(--dl-surface)',
    barClass: 'tier-bar-fill-watch',
  },
  'at-risk': {
    label: 'At risk',
    color: '#71747f',
    bg: 'var(--dl-surface)',
    barClass: 'tier-bar-fill-at-risk',
  },
  critical: {
    label: 'Critical',
    color: '#4a4d55',
    bg: 'var(--dl-surface)',
    barClass: 'tier-bar-fill-critical',
  },
}

const TIER_ORDER: Tier[] = ['critical', 'at-risk', 'watch', 'healthy']

function MetricChip({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: number | string
  valueClassName?: string
}) {
  return (
    <div className="flex flex-1 flex-col items-center px-2 py-1 text-center">
      <span
        className={cn(
          'text-[22px] font-semibold tabular-nums leading-none tracking-tight',
          valueClassName ?? 'text-dl-forest'
        )}
      >
        {value}
      </span>
      <span className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-dl-muted">
        {label}
      </span>
    </div>
  )
}

export function RepoCard({ repo, onRescan }: RepoCardProps) {
  const { packages } = useAppData()
  const [scanning, setScanning] = useState(false)

  const repoPackages = packages.filter(p => p.repoName === getRepoFullName(repo))
  const breakdown = getTierBreakdown(repo, packages)
  const criticalCount = getCriticalCount(repo, packages)
  const atRiskCount = getAtRiskCount(repo, packages)
  const avgSpsColor = getAvgSpsColorClass(repo)
  const worstPkg = repoPackages.find(p => p.name === repo.worstPackage.name)
  const worstHref = worstPkg ? `/packages/${worstPkg.id}` : `/packages/${repo.worstPackage.name}`

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
        'dash-panel overflow-hidden transition-colors',
        scanning && 'border-dl-teal'
      )}
      animate={
        scanning
          ? {
              boxShadow: [
                '0 0 0 0 rgba(17,17,17,0)',
                '0 0 0 3px rgba(17,17,17,0.2)',
                '0 0 0 0 rgba(17,17,17,0)',
              ],
            }
          : { boxShadow: '0 0 0 0 rgba(17,17,17,0)' }
      }
      transition={scanning ? { duration: 0.65, repeat: 2, ease: 'easeInOut' } : { duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-dl-border px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-dl-border bg-dl-surface">
            <GitBranch className="h-5 w-5 text-dl-teal" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-mono text-[16px] font-semibold text-dl-forest">
              {repo.name}
            </h2>
            <p className="truncate text-[12px] text-dl-hint">
              {repo.org}
              <span className="sm:hidden"> · {getLastScannedLabel(repo)}</span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-[11px] text-dl-hint sm:inline">
            {getLastScannedLabel(repo)}
          </span>
          <button
            type="button"
            className="btn-dash-secondary flex items-center gap-1.5 px-3 py-1.5 text-[12px]"
            onClick={handleScan}
            disabled={scanning}
          >
            <RefreshCw className={cn('h-3.5 w-3.5', scanning && 'animate-spin')} aria-hidden />
            {scanning ? 'Scanning…' : 'Scan now'}
          </button>
        </div>
      </div>

      {/* AI summary */}
      <div className="mx-5 mt-4 flex gap-2.5 rounded-xl border border-dl-teal/20 bg-dl-teal/5 px-4 py-3">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dl-teal" aria-hidden />
        <p className="text-[12px] leading-relaxed text-dl-muted">{getAiHealthSummary(repo)}</p>
      </div>

      {/* Body */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Metrics + worst package */}
        <div className="border-b border-dl-border px-5 py-5 lg:border-b-0 lg:border-r">
          <div className="flex items-stretch rounded-xl border border-dl-border bg-dl-surface/60 px-1 py-4">
            <MetricChip label="Packages" value={repo.packageCount} />
            <div className="w-px shrink-0 self-stretch bg-dl-border" aria-hidden />
            <MetricChip label="Avg SPS" value={repo.avgSps} valueClassName={avgSpsColor} />
            <div className="w-px shrink-0 self-stretch bg-dl-border" aria-hidden />
            <MetricChip
              label="Critical"
              value={criticalCount}
              valueClassName={criticalCount > 0 ? 'text-dl-critical' : 'text-dl-forest'}
            />
            <div className="w-px shrink-0 self-stretch bg-dl-border" aria-hidden />
            <MetricChip
              label="At risk"
              value={atRiskCount}
              valueClassName={atRiskCount > 0 ? 'text-dl-risk' : 'text-dl-forest'}
            />
          </div>

          {repo.worstPackage.name !== '—' && (
            <Link
              href={worstHref}
              className={cn(
                'group mt-4 flex items-center gap-3 rounded-xl border border-dl-border bg-dl-surface p-3.5 transition-colors hover:border-dl-teal/40 hover:bg-dl-teal/5',
                'border-l-[3px]',
                repo.worstPackage.tier === 'critical'
                  ? 'border-l-dl-critical'
                  : repo.worstPackage.tier === 'at-risk'
                    ? 'border-l-dl-risk'
                    : repo.worstPackage.tier === 'watch'
                      ? 'border-l-dl-watch'
                      : 'border-l-dl-healthy'
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-dl-muted">
                  Highest risk
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-medium text-dl-forest">
                    {repo.worstPackage.name}
                  </span>
                  <TierChip tier={repo.worstPackage.tier} />
                </div>
              </div>
              <SPSBadge score={repo.worstPackage.sps} tier={repo.worstPackage.tier} size="sm" />
              <ArrowUpRight className="h-4 w-4 shrink-0 text-dl-muted transition-colors group-hover:text-dl-teal" />
            </Link>
          )}
        </div>

        {/* Distribution + top risks */}
        <div className="px-5 py-5">
          <p className="dash-section-label mb-3">Package health</p>

          {repo.packageCount > 0 && (
            <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-dl-border">
              {TIER_ORDER.map(tier => {
                const row = breakdown.find(b => b.tier === tier)
                if (!row || row.pct === 0) return null
                return (
                  <div
                    key={tier}
                    className={cn('h-full transition-[width] duration-500', TIER_CONFIG[tier].barClass)}
                    style={{ width: `${row.pct}%` }}
                    title={`${TIER_CONFIG[tier].label}: ${row.count}`}
                  />
                )
              })}
            </div>
          )}

          <div className="space-y-2.5">
            {breakdown.map(row => {
              const cfg = TIER_CONFIG[row.tier]
              return (
                <div key={row.tier} className="flex items-center gap-3">
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    {row.count}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-dl-text">{cfg.label}</span>
                      <span className="text-[10px] tabular-nums text-dl-muted">{row.pct}%</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="h-full rounded-full transition-[width] duration-700 ease-out"
                        style={{ width: `${row.pct}%`, background: cfg.color }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
