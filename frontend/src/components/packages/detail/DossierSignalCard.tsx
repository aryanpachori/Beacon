import type { Package, Signal } from '@/types'
import {
  getSignalExplanation,
  getSignalBarClass,
} from '@/lib/packageDetailData'
import { cn } from '@/lib/utils'

const SIGNAL_LABELS: Record<keyof Package['signals'], string> = {
  commitVelocity: 'Commit velocity',
  maintainerActivity: 'Maintainer activity',
  funding: 'Funding',
  issueResolution: 'Issue resolution',
  communityHealth: 'Community',
  securityHygiene: 'Security',
}

interface DossierSignalCardProps {
  pkg: Package
  signalKey: keyof Package['signals']
  signal: Signal
}

export function DossierSignalCard({ pkg, signalKey, signal }: DossierSignalCardProps) {
  const explanation = getSignalExplanation(pkg, signalKey, signal)
  const fillClass = getSignalBarClass(signal.value)

  return (
    <div className="dash-card flex h-full flex-col p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-[12px] font-medium text-dl-forest">
          {SIGNAL_LABELS[signalKey]}
        </span>
        <span className="shrink-0 rounded-full border border-dl-border bg-[rgba(255,255,255,0.04)] px-2 py-0.5 text-[10px] font-medium uppercase text-dl-muted">
          {signal.weight}
        </span>
      </div>
      <div className="signal-bar-track shrink-0">
        <div
          className={cn('transition-all', fillClass)}
          style={{ width: `${signal.value}%` }}
        />
      </div>
      <p className="mt-2 flex-1 text-[11px] leading-relaxed text-dl-hint">{explanation}</p>
    </div>
  )
}
