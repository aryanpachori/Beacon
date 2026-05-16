'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import type { Tier } from '@/types'
import { alerts } from '@/lib/mockData'
import { AlertCard } from '@/components/alerts/AlertCard'
import { cn } from '@/lib/utils'

type FilterTab = 'all' | Tier | 'resolved'

const TABS: { label: string; value: FilterTab }[] = [
  { label: 'All',      value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'At risk',  value: 'at-risk' },
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-dash-text">Alerts</h1>
        <p className="text-sm text-dash-muted mt-0.5">{alerts.length} alerts in the last 30 days</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-5">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              'px-3 py-1.5 rounded text-xs font-medium transition-colors',
              filter === tab.value
                ? 'bg-white/10 text-dash-text'
                : 'text-dash-muted hover:text-dash-text'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Bell className="w-8 h-8 text-dash-muted" />
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
