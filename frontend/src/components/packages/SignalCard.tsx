import type { Signal } from '@/types'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

const SIGNAL_LABELS: Record<string, string> = {
  commitVelocity: 'Commit velocity',
  maintainerActivity: 'Maintainer activity',
  funding: 'Funding',
  issueResolution: 'Issue resolution',
  communityHealth: 'Community health',
  securityHygiene: 'Security hygiene',
}

const TREND_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
}

const TREND_COLOR = {
  up: 'text-dl-healthy',
  down: 'text-dl-critical',
  stable: 'text-dl-muted',
}

interface SignalCardProps {
  signalKey: string
  signal: Signal
}

export function SignalCard({ signalKey, signal }: SignalCardProps) {
  const TrendIcon = TREND_ICON[signal.trend]
  const barWidth = `${signal.value}%`

  return (
    <div className="dash-card">
      <div className="mb-2 flex items-center justify-between">
        <span className="mb-2 text-[13px] font-medium text-dl-forest">
          {SIGNAL_LABELS[signalKey] ?? signalKey}
        </span>
        <div className="flex items-center gap-1.5">
          <TrendIcon className={cn('h-3 w-3', TREND_COLOR[signal.trend])} />
          <span className="rounded-full bg-dl-cream px-2 py-0.5 text-[10px] font-medium text-dl-forest">
            {signal.weight}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-dl-border">
          <div
            className="h-1.5 rounded-full bg-dl-teal"
            style={{ width: barWidth }}
          />
        </div>
        <span className="w-6 text-right font-mono text-[13px] text-dl-forest">{signal.value}</span>
      </div>
    </div>
  )
}
