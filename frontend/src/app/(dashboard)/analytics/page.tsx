'use client'

import { NotificationBell } from '@/components/dashboard/NotificationBell'
import { InsightsDashboard } from '@/components/dashboard/InsightsDashboard'

export default function AnalyticsPage() {
  return (
    <div className="app-page">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="page-heading">Analytics</h2>
          <p className="page-description">Deep-dive into your stack health, signal trends, and package movements</p>
        </div>
        <NotificationBell />
      </div>
      <InsightsDashboard />
    </div>
  )
}
