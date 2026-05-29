import type { Signal } from '@/types'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

const SIGNAL_LABELS: Record<string, string> = {
  commitVelocity:     'Commit velocity',
  maintainerActivity: 'Maintainer activity',
  funding:            'Funding',
  issueResolution:    'Issue resolution',
  communityHealth:    'Community health',
  securityHygiene:    'Security hygiene',
}

const TREND_ICON = {
  up:     TrendingUp,
  down:   TrendingDown,
  stable: Minus,
}

const TREND_COLOR = {
  up:     'text-dl-healthy',
  down:   'text-dl-critical',
  stable: 'text-dash-muted',
}

interface SignalCardProps {
  signalKey: string
  signal: Signal
}

export function SignalCard({ signalKey, signal }: SignalCardProps) {
  const TrendIcon = TREND_ICON[signal.trend]
  const barWidth = `${signal.value}%`
  const barColor = signal.value >= 70 ? 'bg-dl-healthy' : signal.value >= 40 ? 'bg-dl-watch' : 'bg-dl-critical'

  return (
    <div className="rounded-[14px] border border-dash-border bg-dash-surface p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-dash-muted">{SIGNAL_LABELS[signalKey] ?? signalKey}</span>
        <div className="flex items-center gap-1">
          <TrendIcon className={cn('w-3 h-3', TREND_COLOR[signal.trend])} />
          <span className={cn('text-xs font-medium', signal.weight === 'high' ? 'text-dash-text' : 'text-dash-muted')}>
            {signal.weight === 'high' ? '↑' : '·'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-dl-m-border/50">
          <div
            className={cn('h-full rounded-full transition-all', barColor)}
            style={{ width: barWidth }}
          />
        </div>
        <span className="text-xs font-mono text-dash-text w-6 text-right">{signal.value}</span>
      </div>
    </div>
  )
}
