'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import type { Tier } from '@/types'
import { useAppData } from '@/context/AppDataContext'
import { AlertCard } from '@/components/alerts/AlertCard'
import { AlertSummaryCard } from '@/components/alerts/AlertSummaryCard'
import { AlertTriageCard } from '@/components/alerts/AlertTriageCard'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { getUnreadCount, isAlertResolved } from '@/lib/alertsData'

type FilterTab = 'all' | Tier | 'resolved'

const TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'At risk', value: 'at-risk' },
  { label: 'Watch', value: 'watch' },
  { label: 'Resolved', value: 'resolved' },
]

export default function AlertsPage() {
  const { alerts, loading, error } = useAppData()
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
      <div className="app-page flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-dl-critical">{error}</p>
      </div>
    )
  }

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
              {visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Bell className="h-10 w-10 text-dl-sage" />
                  <p className="mt-3 text-[14px] text-dl-muted">
                    No alerts yet — they appear when package health crosses your thresholds
                  </p>
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
