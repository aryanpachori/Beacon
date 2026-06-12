'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Package } from '@/types'
import { EcosystemIcon } from '@/components/ui/EcosystemIcon'
import { TierChip } from '@/components/ui/TierChip'
import { HighlightMatch } from '@/components/ui/HighlightMatch'
import { useRelativeTime } from '@/hooks/useRelativeTime'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

function spsColor(sps: number): string {
  if (sps >= 75) return '#16a34a'
  if (sps >= 60) return '#2f7eda'
  if (sps >= 40) return '#ca8a04'
  return '#dc2626'
}

function spsBg(sps: number): string {
  if (sps >= 75) return 'rgba(22, 163, 74, 0.15)'
  if (sps >= 60) return 'rgba(47, 126, 218, 0.15)'
  if (sps >= 40) return 'rgba(202, 138, 4, 0.15)'
  return 'rgba(220, 38, 38, 0.15)'
}

const SIGNAL_KEYS = [
  'commitVelocity', 'maintainerActivity', 'funding',
  'issueResolution', 'communityHealth', 'securityHygiene',
] as const

function signalBarColor(value: number): string {
  if (value >= 70) return '#16a34a'
  if (value >= 50) return '#2f7eda'
  if (value >= 35) return '#ca8a04'
  return '#dc2626'
}

interface PackageCardProps {
  pkg: Package
  index: number
  searchQuery?: string
}

export function PackageCard({ pkg, index, searchQuery = '' }: PackageCardProps) {
  const relTime = useRelativeTime(pkg.lastUpdated)
  const color = spsColor(pkg.scoringPending ? 50 : pkg.sps)
  const bg    = spsBg(pkg.scoringPending ? 50 : pkg.sps)

  const history = pkg.spsHistory
  const last = history[history.length - 1] ?? 0
  const prev = history[history.length - 2] ?? 0
  const delta = last - prev

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.5) }}
      className="group flex flex-col gap-4 rounded-2xl border border-dl-border bg-dl-bg p-4 transition-shadow hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-dl-surface">
          <EcosystemIcon ecosystem={pkg.ecosystem} className="h-5 min-w-5 text-[11px]" />
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/packages/${pkg.id}`}
            className="block truncate text-[13px] font-bold text-dl-navy hover:text-dl-blue transition-colors">
            <HighlightMatch text={pkg.name} query={searchQuery} />
          </Link>
          <p className="truncate text-[11px] text-dl-muted">{pkg.repoName}</p>
        </div>
        {/* SPS circle */}
        <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-full text-[13px] font-bold shadow-sm"
          style={{ background: bg, color }}>
          {pkg.scoringPending ? '…' : pkg.sps}
        </div>
      </div>

      {/* Signal bars */}
      <div className="flex items-end gap-1.5 h-7">
        {SIGNAL_KEYS.map(key => {
          const val = pkg.signals[key]?.value ?? 50
          const h = Math.max(4, Math.round((val / 100) * 28))
          return (
            <div key={key} className="flex flex-1 flex-col items-center">
              <div className="w-full rounded-sm" style={{ height: h, background: signalBarColor(val), opacity: 0.8 }} />
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {pkg.scoringPending ? (
            <span className="rounded-full bg-dl-surface px-2 py-0.5 text-[10px] font-semibold text-dl-muted">Scoring…</span>
          ) : (
            <TierChip tier={pkg.tier} />
          )}
          {/* Trend */}
          {history.length >= 2 && (
            delta > 2  ? <ArrowUpRight  className="h-3.5 w-3.5 text-green-500" /> :
            delta < -2 ? <ArrowDownRight className="h-3.5 w-3.5 text-red-500" /> :
                         <Minus          className="h-3.5 w-3.5 text-dl-border" />
          )}
        </div>
        <span className="text-[10px] text-dl-border">{relTime}</span>
      </div>
    </motion.div>
  )
}
