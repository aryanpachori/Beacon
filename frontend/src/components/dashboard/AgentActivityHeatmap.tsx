'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { fetchAgentActivity, type AgentEventItem } from '@/lib/api'

const WEEKS = 14
const DAYS = 7

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function dayKey(d: Date): string {
  return startOfDay(d).toISOString().slice(0, 10)
}

/** Build a 14-week × 7-day grid ending today (columns = weeks, rows = Sun→Sat). */
function buildHeatmap(events: AgentEventItem[]) {
  const today = startOfDay(new Date())
  const counts = new Map<string, number>()
  for (const e of events) {
    const key = dayKey(new Date(e.createdAt || e.detectedAt))
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  // Align to start of current week (Sunday)
  const dayOfWeek = today.getDay()
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (6 - dayOfWeek))

  const cells: { date: Date; count: number }[][] = []
  for (let w = WEEKS - 1; w >= 0; w--) {
    const col: { date: Date; count: number }[] = []
    for (let d = 0; d < DAYS; d++) {
      const date = new Date(endOfWeek)
      date.setDate(endOfWeek.getDate() - w * 7 - (6 - d))
      const count = counts.get(dayKey(date)) ?? 0
      col.push({ date, count })
    }
    cells.push(col)
  }

  return cells
}

function cellColor(count: number): string {
  if (count <= 0) return 'var(--dl-surface, #f0f0f0)'
  if (count === 1) return 'rgba(37, 99, 235, 0.25)'
  if (count <= 3) return 'rgba(37, 99, 235, 0.5)'
  if (count <= 8) return 'rgba(37, 99, 235, 0.75)'
  return 'rgb(37, 99, 235)'
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

  return (
    <div className="dl-card">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="card-heading">Agent Activity</h3>
          <p className="mt-0.5 text-[11px] text-dl-muted">
            CLI, MCP, and IDE scans over the last 14 weeks
          </p>
        </div>
        <Link
          href="/agent-activity"
          className="flex items-center gap-1 text-[11px] font-medium text-dl-blue hover:underline"
        >
          {hasActivity ? 'View all' : 'Connect'} <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {grid.map((week, w) => (
          <div key={w} className="flex flex-col gap-[3px]">
            {week.map((cell, d) => (
              <div
                key={d}
                className="h-[11px] w-[11px] rounded-[2px]"
                style={{ background: cellColor(cell.count) }}
                title={
                  cell.count > 0
                    ? `${cell.date.toLocaleDateString()}: ${cell.count} event(s)`
                    : `${cell.date.toLocaleDateString()}: no activity`
                }
              />
            ))}
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-dl-muted">
        {loading
          ? 'Loading activity…'
          : hasActivity
            ? `${total} event(s) from local scans — denser blue = more findings that day.`
            : 'No agent activity yet — connect the CLI, MCP, or IDE extension to start filling this in.'}
      </p>
    </div>
  )
}
