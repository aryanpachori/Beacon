'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import type { Tier } from '@/types'
import { alerts } from '@/lib/mockData'
import { AlertCard } from '@/components/alerts/AlertCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterTabs } from '@/components/ui/FilterTabs'

type FilterTab = 'all' | Tier | 'resolved'

const TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'At risk', value: 'at-risk' },
  { label: 'Resolved', value: 'resolved' },
]

export default function AlertsPage() {
  const [filter, setFilter] = useState<FilterTab>('all')

  const visible = alerts.filter(a => {
    if (filter === 'all') return true
    if (filter === 'resolved') return a.slackSent && a.jiraCreated
    return a.tier === filter
  })

  return (
    <div className="app-page-narrow">
      <PageHeader
        title="Alerts"
        description={`${alerts.length} alerts in the last 30 days`}
      />

      <FilterTabs tabs={TABS} value={filter} onChange={setFilter} className="mb-6" />

      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="flex flex-col gap-3"
        >
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-[14px] border border-dash-border bg-dash-surface py-16">
              <Bell className="h-8 w-8 text-dash-muted" />
              <p className="text-sm text-dash-muted">No alerts — your stack looks healthy</p>
            </div>
          ) : (
            visible.map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
