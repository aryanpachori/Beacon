import type { Alert } from '@/types'
import { TierChip } from '@/components/ui/TierChip'
import { tierColor } from '@/lib/constants'
import { timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AlertCardProps {
  alert: Alert
  compact?: boolean
}

export function AlertCard({ alert, compact = false }: AlertCardProps) {
  const borderClass = tierColor(alert.tier, 'border')

  return (
    <div
      className={cn(
        'rounded-lg border border-dash-border bg-dash-surface border-l-[3px] flex items-start gap-4',
        compact ? 'px-3 py-2.5' : 'px-4 py-3.5',
        borderClass
      )}
    >
      {/* Left */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <TierChip tier={alert.tier} />
          <span className="text-sm font-medium text-dash-text truncate">{alert.packageName}</span>
        </div>
        {!compact && (
          <p className="text-xs text-dash-muted truncate">
            {alert.repos.join(', ')}
          </p>
        )}
      </div>

      {/* Centre — SPS drop */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-sm font-mono text-dash-muted">{alert.spsBefore}</span>
        <span className="text-xs text-dash-muted mx-0.5">→</span>
        <span className={cn('text-sm font-bold font-mono', tierColor(alert.tier, 'text'))}>
          {alert.spsAfter}
        </span>
      </div>

      {/* Right */}
      {!compact && (
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-xs text-dash-muted">{timeAgo(alert.firedAt)}</span>
          <div className="flex gap-1.5">
            <button
              disabled
              className="px-2.5 py-1 rounded border border-dash-border text-xs text-dash-muted opacity-40 cursor-not-allowed"
            >
              Slack
            </button>
            <button
              disabled
              className="px-2.5 py-1 rounded border border-dash-border text-xs text-dash-muted opacity-40 cursor-not-allowed"
            >
              Jira
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
