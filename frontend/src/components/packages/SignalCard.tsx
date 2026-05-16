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
  stable: 'text-dl-muted',
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
    <div className="rounded-lg border border-dl-border bg-dl-surface p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-dl-muted">{SIGNAL_LABELS[signalKey] ?? signalKey}</span>
        <div className="flex items-center gap-1">
          <TrendIcon className={cn('w-3 h-3', TREND_COLOR[signal.trend])} />
          <span className={cn('text-xs font-medium', signal.weight === 'high' ? 'text-dl-text' : 'text-dl-muted')}>
            {signal.weight === 'high' ? '↑' : '·'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/5">
          <div
            className={cn('h-full rounded-full transition-all', barColor)}
            style={{ width: barWidth }}
          />
        </div>
        <span className="text-xs font-mono text-dl-text w-6 text-right">{signal.value}</span>
      </div>
    </div>
  )
}
