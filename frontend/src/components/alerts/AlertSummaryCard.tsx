import type { Alert } from '@/types'
import { getWeeklySummary } from '@/lib/alertsData'

const ROWS = [
  { key: 'total', label: 'Total alerts' },
  { key: 'criticalFired', label: 'Critical fired' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'avgSpsDrop', label: 'Avg SPS drop', suffix: 'pts' },
] as const

export function AlertSummaryCard({ alerts = [] }: { alerts?: Alert[] }) {
  const summary = getWeeklySummary(alerts)

  return (
    <div className="dash-card mb-4 p-5">
      <p className="dash-section-label mb-4">This week</p>
      <dl className="space-y-3">
        {ROWS.map(row => {
          const value = summary[row.key]
          const display =
            row.key === 'avgSpsDrop' ? `${value}${row.suffix ?? ''}` : String(value)
          return (
            <div key={row.key} className="flex items-center justify-between gap-4">
              <dt className="text-[13px] text-dl-muted">{row.label}</dt>
              <dd className="text-[13px] font-medium text-dl-forest tabular-nums">{display}</dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}
