'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, CheckCircle, RefreshCw } from 'lucide-react'
import type { Tier } from '@/types'
import { useAppData } from '@/context/AppDataContext'
import { AlertCard } from '@/components/alerts/AlertCard'
import { AlertSummaryCard } from '@/components/alerts/AlertSummaryCard'
import { AlertTriageCard } from '@/components/alerts/AlertTriageCard'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { getUnreadCount, isAlertResolved } from '@/lib/alertsData'
import Link from 'next/link'

type FilterTab = 'all' | Tier | 'resolved'

const TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'At risk', value: 'at-risk' },
  { label: 'Watch', value: 'watch' },
  { label: 'Resolved', value: 'resolved' },
]

export default function AlertsPage() {
  const { alerts, loading, error, refresh } = useAppData()
  const [filter, setFilter] = useState<FilterTab>('all')
  const unreadCount = getUnreadCount(alerts)

  const visible = alerts.filter(a => {
    if (filter === 'all') return true
    if (filter === 'resolved') return isAlertResolved(a)
    return a.tier === filter
  })

  if (loading) {
    return (
      <div className="app-page flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-dl-muted">Loading alerts…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-page flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-dl-critical">Could not load alerts. Check your connection.</p>
        <button
          type="button"
          onClick={refresh}
          className="btn-dash-secondary flex items-center gap-1.5 text-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    )
  }

  const hasFilterActive = filter !== 'all'
  const noAlertsTotal = alerts.length === 0
  const noFilterMatch = visible.length === 0 && !noAlertsTotal

  return (
    <div className="app-page">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="page-heading">Alerts</h1>
        {unreadCount > 0 && (
          <span className="rounded-full bg-dl-critical/15 px-2 py-0.5 text-[11px] font-medium text-dl-critical">
            {unreadCount} unread
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,65%)_minmax(0,35%)]">
        <div className="min-w-0">
          <FilterTabs tabs={TABS} value={filter} onChange={setFilter} className="mb-4" />

          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {noAlertsTotal ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-dl-teal/10">
                    <CheckCircle className="h-6 w-6 text-dl-teal" />
                  </div>
                  <p className="text-[15px] font-medium text-dl-forest">
                    Your stack is clean — no alerts fired yet
                  </p>
                  <p className="mt-1 text-[13px] text-dl-muted">
                    Alerts appear when package health crosses your thresholds.
                  </p>
                  <Link
                    href="/packages"
                    className="mt-4 text-[13px] font-medium text-dl-teal hover:underline"
                  >
                    View packages →
                  </Link>
                </div>
              ) : noFilterMatch ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Bell className="mb-3 h-9 w-9 text-dl-hint opacity-50" />
                  <p className="text-[14px] font-medium text-dl-forest">
                    No {hasFilterActive ? filter : ''} alerts
                  </p>
                  <button
                    onClick={() => setFilter('all')}
                    className="mt-2 text-[13px] text-dl-teal hover:underline"
                  >
                    Show all alerts
                  </button>
                </div>
              ) : (
                visible.map(alert => <AlertCard key={alert.id} alert={alert} />)
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <AlertSummaryCard alerts={alerts} />
          <AlertTriageCard />
        </aside>
      </div>
    </div>
  )
}
