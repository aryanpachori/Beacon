'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle, TrendingDown, TrendingUp, ShieldAlert,
  Activity, CheckCircle2, ChevronRight, Package,
} from 'lucide-react'
import Link from 'next/link'
import { fetchActivity, type ActivityEvent } from '@/lib/api'

/* ── Ecosystem color map ─────────────────────────────────────────────── */
const ECO_COLORS: Record<string, string> = {
  npm:   '#f7df1e', pypi: '#3776ab', cargo: '#dea584',
  maven: '#c71a36', gem:  '#cc342d', go:    '#00add8',
}

/* ── Alert type config ───────────────────────────────────────────────── */
function eventConfig(type: string) {
  switch (type) {
    case 'tier_change':   return { icon: TrendingDown, color: '#dc2626', bg: 'rgba(220,38,38,0.15)', label: 'Tier change' }
    case 'threshold':     return { icon: AlertTriangle, color: '#ea580c', bg: 'rgba(234,88,12,0.15)', label: 'Threshold crossed' }
    case 'recovery':      return { icon: TrendingUp,   color: '#16a34a', bg: 'rgba(22,163,74,0.15)', label: 'Recovery' }
    case 'supply_chain':  return { icon: ShieldAlert,  color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', label: 'Supply chain' }
    default:              return { icon: Activity,     color: 'var(--dl-muted)', bg: 'var(--dl-surface)', label: type }
  }
}

function tierColor(tier: string) {
  switch (tier) {
    case 'critical': return '#dc2626'
    case 'at_risk':
    case 'at-risk':  return '#ea580c'
    case 'watch':    return '#ca8a04'
    case 'healthy':  return '#16a34a'
    default:         return '#9fa0b5'
  }
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />
}

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchActivity(100)
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const FILTERS = [
    { key: 'all',          label: 'All' },
    { key: 'tier_change',  label: 'Tier changes' },
    { key: 'threshold',    label: 'Thresholds' },
    { key: 'recovery',     label: 'Recoveries' },
    { key: 'supply_chain', label: 'Supply chain' },
  ]

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter)

  return (
    <div className="app-page">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="page-heading">Activity</h2>
          <p className="page-description">
            {events.length > 0
              ? `${events.length} events across your monitored packages`
              : 'Chronological feed of dependency health events'}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-xl px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
              filter === f.key
                ? 'bg-dl-navy text-dl-bg shadow-sm dark:bg-dl-blue dark:text-[#0b0a08]'
                : 'bg-dl-bg border border-dl-border text-dl-muted hover:border-dl-muted hover:text-dl-text'
            }`}
          >
            {f.label}
            {f.key !== 'all' && (
              <span className={`ml-1.5 text-[10px] ${filter === f.key ? 'opacity-70' : 'text-white/30'}`}>
                {events.filter(e => e.type === f.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Event list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dl-border bg-dl-bg py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-dl-surface">
            <Activity className="h-7 w-7 text-dl-border" />
          </div>
          <p className="text-[15px] font-semibold text-dl-navy">No events yet</p>
          <p className="mt-1.5 max-w-sm text-sm text-dl-muted">
            Activity appears here after GitHub is connected and your first scan completes.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((event, i) => {
            const cfg = eventConfig(event.type)
            const IconComp = cfg.icon
            const ecoColor = ECO_COLORS[event.ecosystem] ?? '#9fa0b5'
            const tColor = tierColor(event.tier)

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="group flex items-start gap-4 rounded-2xl border border-dl-border bg-dl-bg p-4 transition-all hover:border-dl-muted hover:shadow-sm"
              >
                {/* Event type icon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: cfg.bg }}>
                  <IconComp className="h-4 w-4" style={{ color: cfg.color }} />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {/* Ecosystem dot */}
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: ecoColor }} />
                    {/* Package name */}
                    <span className="text-[13px] font-bold text-dl-navy truncate">{event.packageName}</span>
                    {/* Event type label */}
                    <span className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    {/* Tier badge */}
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                      style={{ background: `${tColor}15`, color: tColor }}>
                      {event.tier.replace('_', '-')}
                    </span>
                    {event.resolved && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600">
                        <CheckCircle2 className="h-3 w-3" /> resolved
                      </span>
                    )}
                  </div>

                  {/* SPS change */}
                  {event.spsBefore != null && event.spsAfter != null && (
                    <p className="text-[12px] text-dl-muted mb-1">
                      SPS{' '}
                      <span className="font-bold" style={{ color: tierColor(event.tier) }}>
                        {event.spsBefore} → {event.spsAfter}
                      </span>
                      {' '}
                      <span className={event.spsAfter > event.spsBefore ? 'text-green-600' : 'text-red-500'}>
                        ({event.spsAfter > event.spsBefore ? '+' : ''}{event.spsAfter - event.spsBefore})
                      </span>
                    </p>
                  )}

                  {/* AI reason */}
                  {event.aiReason && (
                    <p className="text-[12px] text-dl-muted line-clamp-2">{event.aiReason}</p>
                  )}

                  {/* CVE info */}
                  {event.cveId && (
                    <p className="mt-1 text-[11px] font-semibold text-[#8b5cf6]">CVE: {event.cveId}</p>
                  )}
                </div>

                {/* Right: time + link */}
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-[11px] text-dl-muted">{relativeTime(event.firedAt)}</span>
                  <Link
                    href={`/packages/${event.packageId}`}
                    className="flex items-center gap-1 rounded-lg border border-dl-border bg-dl-surface px-2.5 py-1 text-[11px] font-semibold text-dl-text hover:border-dl-blue/30 hover:bg-dl-blue-pale hover:text-dl-blue transition-all"
                  >
                    <Package className="h-3 w-3" />
                    View
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
