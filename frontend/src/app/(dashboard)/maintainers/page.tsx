'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, TrendingDown, GitBranch, Star, BookOpen,
  AlertTriangle, CheckCircle2, Clock,
} from 'lucide-react'
import Link from 'next/link'
import { fetchMaintainers, type MaintainerOverview } from '@/lib/api'
import { NotificationBell } from '@/components/dashboard/NotificationBell'

const TIER_COLOR: Record<string, string> = {
  critical: '#dc2626', at_risk: '#ea580c', 'at-risk': '#ea580c',
  watch: '#ca8a04', healthy: '#16a34a',
}

function riskConfig(level: 'low' | 'medium' | 'high') {
  switch (level) {
    case 'high':   return { label: 'High risk',   color: '#dc2626', bg: '#fef2f2', icon: AlertTriangle }
    case 'medium': return { label: 'Med risk',    color: '#ca8a04', bg: '#fefce8', icon: Clock }
    default:       return { label: 'Active',      color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle2 }
  }
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />
}

export default function MaintainersPage() {
  const [maintainers, setMaintainers] = useState<MaintainerOverview[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  useEffect(() => {
    fetchMaintainers()
      .then(setMaintainers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? maintainers : maintainers.filter(m => m.riskLevel === filter)

  const highRisk   = maintainers.filter(m => m.riskLevel === 'high').length
  const medRisk    = maintainers.filter(m => m.riskLevel === 'medium').length
  const activeCount = maintainers.filter(m => m.riskLevel === 'low').length

  return (
    <div className="app-page">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="page-heading">Maintainers</h2>
          <p className="page-description">
            Activity health of all primary maintainers across your monitored packages
          </p>
        </div>
        <NotificationBell />
      </div>

      {/* KPI strip */}
      {!loading && maintainers.length > 0 && (
        <div className="mb-5 grid grid-cols-3 gap-3">
          {[
            { label: 'High risk', value: highRisk,    color: '#dc2626', bg: '#fef2f2' },
            { label: 'Medium risk', value: medRisk,   color: '#ca8a04', bg: '#fefce8' },
            { label: 'Active',    value: activeCount, color: '#16a34a', bg: '#f0fdf4' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-dl-border bg-dl-bg p-4">
              <p className="text-[22px] font-bold text-dl-navy">{value}</p>
              <p className="mt-0.5 text-[11px] font-semibold" style={{ color }}>{label}</p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-dl-surface">
                <div className="h-full rounded-full" style={{
                  background: color,
                  width: maintainers.length > 0 ? `${(value / maintainers.length) * 100}%` : '0%'
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="mb-5 flex items-center gap-2">
        {(['all', 'high', 'medium', 'low'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-xl px-3.5 py-1.5 text-[12px] font-semibold transition-all capitalize ${
              filter === f
                ? 'bg-dl-navy text-dl-bg shadow-sm dark:bg-dl-blue dark:text-white'
                : 'bg-dl-bg border border-dl-border text-dl-muted hover:text-dl-text'
            }`}
          >
            {f === 'low' ? 'Active' : f === 'all' ? 'All' : `${f.charAt(0).toUpperCase() + f.slice(1)} risk`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[160px] w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dl-border bg-dl-bg py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-dl-surface">
            <Users className="h-7 w-7 text-dl-border" />
          </div>
          <p className="text-[15px] font-semibold text-dl-navy">No maintainer data yet</p>
          <p className="mt-1.5 max-w-sm text-sm text-dl-muted">
            Maintainer profiles are collected during package scanning. Run a scan to populate this view.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, i) => {
            const risk = riskConfig(m.riskLevel)
            const RiskIcon = risk.icon
            const initials = (m.displayName || m.login)
              .split(/\s+/)
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.4) }}
                className="flex flex-col gap-4 rounded-2xl border border-dl-border bg-dl-bg p-5 transition-shadow hover:shadow-md"
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  {/* Avatar (Initials) */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6600] to-[#e55c00] text-[12px] font-bold text-white shadow-sm">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[14px] font-bold text-dl-navy">{m.displayName}</p>
                    <a
                      href={`https://github.com/${m.login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-dl-muted hover:text-dl-blue transition-colors"
                    >
                      <GitBranch className="h-3 w-3" />
                      @{m.login}
                    </a>
                  </div>
                  {/* Risk badge */}
                  <div className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold uppercase"
                    style={{ background: risk.bg, color: risk.color }}>
                    <RiskIcon className="h-3 w-3" />
                    {m.daysInactive}d
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-dl-surface px-2 py-2 text-center">
                    <div className="flex items-center justify-center gap-0.5 text-[11px] font-bold text-dl-navy">
                      <TrendingDown className="h-3 w-3 text-dl-muted" />
                      {m.daysInactive}d
                    </div>
                    <p className="text-[9px] text-dl-muted mt-0.5">inactive</p>
                  </div>
                  <div className="rounded-xl bg-dl-surface px-2 py-2 text-center">
                    <div className="flex items-center justify-center gap-0.5 text-[11px] font-bold text-dl-navy">
                      <BookOpen className="h-3 w-3 text-dl-muted" />
                      {m.publicReposCount}
                    </div>
                    <p className="text-[9px] text-dl-muted mt-0.5">repos</p>
                  </div>
                  <div className="rounded-xl bg-dl-surface px-2 py-2 text-center">
                    <div className="flex items-center justify-center gap-0.5 text-[11px] font-bold text-dl-navy">
                      <Star className="h-3 w-3 text-dl-muted" />
                      {m.followersCount}
                    </div>
                    <p className="text-[9px] text-dl-muted mt-0.5">followers</p>
                  </div>
                </div>

                {/* Package list */}
                <div>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-dl-border">
                    Packages ({m.packages.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.packages.slice(0, 4).map(pkg => (
                      <Link
                        key={pkg.id}
                        href={`/packages/${pkg.id}`}
                        className="rounded-lg border border-dl-border bg-dl-surface px-2 py-1 text-[11px] font-semibold text-dl-text hover:border-dl-blue/30 hover:bg-dl-blue-pale hover:text-dl-blue transition-all"
                        style={{ borderLeft: `2px solid ${TIER_COLOR[pkg.tier ?? 'watch'] ?? 'rgba(255,255,255,0.12)'}` }}
                      >
                        {pkg.name}
                      </Link>
                    ))}
                    {m.packages.length > 4 && (
                      <span className="rounded-lg bg-dl-surface px-2 py-1 text-[11px] text-dl-muted">
                        +{m.packages.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Sponsor badge */}
                {m.isSponsorEnabled && (
                  <div className="rounded-lg bg-[#fff7ed] px-3 py-1.5 text-[11px] font-semibold text-[#ea580c]">
                    ♥ GitHub Sponsors enabled
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
