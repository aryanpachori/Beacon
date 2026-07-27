'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Package } from '@/types'
import { EcosystemIcon } from '@/components/ui/EcosystemIcon'
import { TierChip } from '@/components/ui/TierChip'
import { HighlightMatch } from '@/components/ui/HighlightMatch'
import { useRelativeTime } from '@/hooks/useRelativeTime'
import { Minus, AlertTriangle, ChevronRight } from 'lucide-react'
import { SparklineBar } from '@/components/ui/SparklineBar'
import { cn } from '@/lib/utils'

/* ── SPS color util ──────────────────────────────────────────────────── */
function spsColor(sps: number): string {
  if (sps >= 75) return '#16a34a'
  if (sps >= 60) return '#5B6E4C'
  if (sps >= 40) return '#ca8a04'
  return '#dc2626'
}

function spsBg(sps: number): string {
  if (sps >= 75) return 'rgba(22, 163, 74, 0.15)'
  if (sps >= 60) return 'rgba(91,110,76, 0.15)'
  if (sps >= 40) return 'rgba(202, 138, 4, 0.15)'
  return 'rgba(220, 38, 38, 0.15)'
}

/* ── Signal mini-bars ────────────────────────────────────────────────── */
const SIGNAL_KEYS = [
  'commitVelocity', 'maintainerActivity', 'funding',
  'issueResolution', 'communityHealth', 'securityHygiene',
] as const

const SIGNAL_LABELS: Record<string, string> = {
  commitVelocity:    'Commit velocity',
  maintainerActivity: 'Maintainer',
  funding:           'Funding',
  issueResolution:   'Issues',
  communityHealth:   'Community',
  securityHygiene:   'Security',
}

function signalBarColor(value: number): string {
  if (value >= 70) return '#16a34a'
  if (value >= 50) return '#5B6E4C'
  if (value >= 35) return '#ca8a04'
  return '#dc2626'
}

function SignalMiniBar({ pkg }: { pkg: Package }) {
  return (
    <div className="flex items-end gap-1" title="Signal health (hover for details)">
      {SIGNAL_KEYS.map(key => {
        const val = pkg.signals[key]?.value ?? 50
        const h = Math.max(4, Math.round((val / 100) * 28))
        return (
          <div key={key} className="group/sig relative flex flex-col items-center">
            <div
              className="w-[5px] rounded-sm opacity-80 group-hover/sig:opacity-100 transition-opacity"
              style={{ height: h, background: signalBarColor(val) }}
            />
            {/* Tooltip on signal bar hover */}
            <div className="pointer-events-none absolute bottom-full mb-1.5 hidden rounded-lg border border-dl-border bg-dl-bg px-2 py-1 shadow-lg group-hover/sig:block whitespace-nowrap z-10">
              <p className="text-[10px] font-semibold text-dl-navy">{SIGNAL_LABELS[key]}</p>
              <p className="text-[10px] text-dl-muted">{Math.round(val)}/100</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function trendData(pkg: Package): number[] {
  if (pkg.spsHistory.length > 0) return pkg.spsHistory.slice(-5)
  if (!pkg.scoringPending && pkg.sps > 0) return Array(5).fill(pkg.sps)
  return []
}

/* ── Maintainer initials ─────────────────────────────────────────────── */
function MaintainerAvatar({ pkg }: { pkg: Package }) {
  const m = pkg.maintainers?.[0]
  const login = m?.login ?? pkg.signalFacts?.primaryMaintainerLogin
  const name  = m?.name  ?? pkg.signalFacts?.primaryMaintainerName
  const label = name ?? login

  if (!label) return null

  const initials = label.slice(0, 2).toUpperCase()
  const days = m?.lastCommitDays ?? pkg.signalFacts?.daysSinceLastCommit ?? 0
  const dotColor = days < 30 ? '#16a34a' : days < 90 ? '#ca8a04' : '#dc2626'

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#9fa0b5] to-[#555663] text-[9px] font-bold text-white">
          {initials}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-dl-bg" style={{ background: dotColor }} />
      </div>
      <span className="max-w-[80px] truncate text-[11px] text-dl-muted">{label}</span>
    </div>
  )
}

interface PackageListRowProps {
  pkg: Package
  index: number
  searchQuery?: string
}

export function PackageListRow({ pkg, index, searchQuery = '' }: PackageListRowProps) {
  const relTime = useRelativeTime(pkg.lastUpdated)
  const color = spsColor(pkg.scoringPending ? 50 : pkg.sps)
  const bg    = spsBg(pkg.scoringPending ? 50 : pkg.sps)
  const trend = trendData(pkg)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.45), duration: 0.2 }}
      className="group relative flex items-center gap-4 border-b border-dl-border bg-dl-bg px-5 py-3.5 last:border-0 transition-colors hover:bg-dl-surface"
    >
      {/* Left: ecosystem icon + name block */}
      <div className="flex w-[220px] shrink-0 items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-dl-surface">
          <EcosystemIcon ecosystem={pkg.ecosystem} className="h-5 min-w-5 text-[11px]" />
        </div>
        <div className="min-w-0">
          <Link
            href={`/packages/${pkg.id}`}
            className="block truncate text-[13px] font-bold text-dl-navy hover:text-dl-blue transition-colors"
          >
            <HighlightMatch text={pkg.name} query={searchQuery} />
          </Link>
          <div className="flex items-center gap-1.5 mt-0.5">
            <code className="text-[10px] text-dl-muted font-mono">{pkg.version}</code>
            {pkg.isDeprecated && (
              <span className="flex items-center gap-0.5 rounded bg-red-500/10 px-1 py-0.5 text-[9px] font-bold uppercase text-red-500">
                <AlertTriangle className="h-2.5 w-2.5" /> deprecated
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Repo name */}
      <div className="hidden w-[120px] shrink-0 sm:block">
        <p className="truncate text-[11px] font-medium text-dl-muted">{pkg.repoName.split('/')[1] ?? pkg.repoName}</p>
      </div>

      {/* Maintainer */}
      <div className="hidden w-[120px] shrink-0 md:flex">
        <MaintainerAvatar pkg={pkg} />
      </div>

      {/* Signal bars */}
      <div className="hidden w-[72px] shrink-0 items-center lg:flex">
        {pkg.scoringPending ? (
          <span className="text-[11px] text-dl-border">Scoring…</span>
        ) : (
          <SignalMiniBar pkg={pkg} />
        )}
      </div>

      {/* Spacer */}
      <div className="min-w-0 flex-1" />

      {/* SPS badge */}
      <div className="flex w-10 shrink-0 items-center justify-center">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold shadow-sm"
          style={{ background: bg, color }}
        >
          {pkg.scoringPending ? '…' : pkg.sps}
        </div>
      </div>

      {/* Trend sparkline */}
      <div className="hidden w-10 shrink-0 items-center justify-center sm:flex">
        {trend.length > 0 ? (
          <SparklineBar data={trend} tier={pkg.tier} />
        ) : (
          <Minus className="h-3.5 w-3.5 text-dl-border" />
        )}
      </div>

      {/* Tier chip */}
      <div className="hidden w-20 shrink-0 items-center md:flex">
        {pkg.scoringPending ? (
          <span className="rounded-full bg-dl-surface px-2 py-1 text-[10px] font-semibold text-dl-muted">Pending</span>
        ) : (
          <TierChip tier={pkg.tier} />
        )}
      </div>

      {/* Updated + hover link */}
      <div className="relative w-[88px] shrink-0">
        <span className="block truncate pr-7 text-right text-[11px] text-dl-muted">{relTime}</span>
        <Link
          href={`/packages/${pkg.id}`}
          className={cn(
            'absolute right-0 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg border border-dl-border text-dl-muted',
            'opacity-0 transition-all group-hover:opacity-100 hover:border-dl-blue/30 hover:bg-dl-blue-pale hover:text-dl-blue'
          )}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  )
}
