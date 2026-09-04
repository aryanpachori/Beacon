'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { fetchAgentActivity, type AgentEventItem } from '@/lib/api'

const WEEKS = 14
const DAYS = 7
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function localDayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

/**
 * GitHub-style grid: columns = weeks (oldest → newest), rows = Sun→Sat.
 * Window ends on the Saturday of the current week (or today if we clamp).
 */
function buildHeatmap(events: AgentEventItem[]) {
  const today = startOfLocalDay(new Date())
  const counts = new Map<string, number>()
  for (const e of events) {
    const when = new Date(e.createdAt || e.detectedAt)
    if (Number.isNaN(when.getTime())) continue
    const key = localDayKey(startOfLocalDay(when))
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  // Sunday of the current week
  const thisSunday = addDays(today, -today.getDay())
  // First Sunday in the window
  const firstSunday = addDays(thisSunday, -(WEEKS - 1) * 7)

  const cells: { date: Date; count: number; future: boolean }[][] = []
  for (let w = 0; w < WEEKS; w++) {
    const col: { date: Date; count: number; future: boolean }[] = []
    for (let d = 0; d < DAYS; d++) {
      const date = addDays(firstSunday, w * 7 + d)
      const future = date.getTime() > today.getTime()
      const count = future ? 0 : counts.get(localDayKey(date)) ?? 0
      col.push({ date, count, future })
    }
    cells.push(col)
  }

  return cells
}

function cellStyle(count: number, future: boolean): React.CSSProperties {
  if (future) {
    return { background: 'transparent' }
  }
  if (count <= 0) {
    return {
      background: 'var(--dl-chip-bg)',
      boxShadow: 'inset 0 0 0 1px var(--dl-border)',
    }
  }
  if (count === 1) return { background: 'rgba(37, 99, 235, 0.28)' }
  if (count <= 3) return { background: 'rgba(37, 99, 235, 0.48)' }
  if (count <= 8) return { background: 'rgba(37, 99, 235, 0.72)' }
  return { background: 'rgb(37, 99, 235)' }
}

export function AgentActivityHeatmap() {
  const [events, setEvents] = useState<AgentEventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchAgentActivity(200)
      .then((data) => {
        if (!cancelled) setEvents(data)
      })
      .catch(() => {
        if (!cancelled) setEvents([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const grid = useMemo(() => buildHeatmap(events), [events])
  const total = events.length
  const hasActivity = total > 0
  const activeDays = useMemo(() => {
    const keys = new Set<string>()
    for (const e of events) {
      const when = new Date(e.createdAt || e.detectedAt)
      if (!Number.isNaN(when.getTime())) keys.add(localDayKey(startOfLocalDay(when)))
    }
    return keys.size
  }, [events])

  return (
    <div className="dl-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="card-heading">Agent Activity</h3>
          <p className="mt-0.5 text-[11px] text-dl-muted">
            CLI, MCP, and IDE scans over the last 14 weeks
          </p>
        </div>
        <Link
          href="/agent-activity"
          className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-dl-blue hover:underline"
        >
          {hasActivity ? 'View all' : 'Connect'} <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex gap-2">
        <div className="flex w-7 shrink-0 flex-col justify-between py-px text-[9px] leading-none text-dl-muted">
          {DAY_LABELS.map((label, i) => (
            <span key={i} className="flex h-[11px] items-center">
              {label}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="inline-flex gap-[3px]">
            {grid.map((week, w) => (
              <div key={w} className="flex flex-col gap-[3px]">
                {week.map((cell, d) => (
                  <div
                    key={d}
                    className="h-[11px] w-[11px] shrink-0 rounded-[2px]"
                    style={cellStyle(cell.count, cell.future)}
                    title={
                      cell.future
                        ? undefined
                        : cell.count > 0
                          ? `${cell.date.toLocaleDateString()}: ${cell.count} event(s)`
                          : `${cell.date.toLocaleDateString()}: no activity`
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-dl-muted">
          {loading
            ? 'Loading activity…'
            : hasActivity
              ? `${total} event(s) across ${activeDays} day(s) — denser blue = more findings.`
              : 'No agent activity yet — connect the CLI, MCP, or IDE extension to start filling this in.'}
        </p>
        <div className="flex items-center gap-1 text-[9px] text-dl-muted">
          <span>Less</span>
          {[0, 1, 3, 8, 12].map((n) => (
            <div
              key={n}
              className="h-[10px] w-[10px] rounded-[2px]"
              style={cellStyle(n, false)}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
