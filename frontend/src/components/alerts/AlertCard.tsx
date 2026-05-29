'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { Alert } from '@/types'
import { TierChip } from '@/components/ui/TierChip'
import { spsToTier, tierColor } from '@/lib/constants'
import { timeAgo } from '@/lib/utils'
import {
  getAlertAiReason,
  getAlertSignalPills,
  getTierChangeLabel,
  isAlertUnread,
} from '@/lib/alertsData'
import { cn } from '@/lib/utils'

interface AlertCardProps {
  alert: Alert
}

const TIER_BORDER: Record<Alert['tier'], string> = {
  critical: 'border-l-dl-critical',
  'at-risk': 'border-l-dl-risk',
  watch: 'border-l-dl-watch',
  healthy: 'border-l-dl-healthy',
}

export function AlertCard({ alert }: AlertCardProps) {
  const beforeTier = spsToTier(alert.spsBefore)
  const afterTier = alert.tier
  const unread = isAlertUnread(alert)
  const pills = getAlertSignalPills(alert)
  const aiReason = getAlertAiReason(alert)

  return (
    <article
      className={cn('dash-card mb-3 border-l-[3px] p-4', TIER_BORDER[alert.tier])}
    >
      <div className="mb-3 flex items-center gap-2">
        <TierChip tier={alert.tier} />
        <span className="text-[15px] font-medium text-dl-forest">{alert.packageName}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-dl-hint">{timeAgo(alert.firedAt)}</span>
          {unread && (
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-dl-teal"
              title="Unread"
              aria-label="Unread alert"
            />
          )}
        </div>
      </div>

      <div className="mb-1 flex items-center gap-2">
        <span
          className={cn('text-[20px] font-medium tabular-nums', tierColor(beforeTier, 'text'))}
        >
          {alert.spsBefore}
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-dl-muted" aria-hidden />
        <span
          className={cn('text-[20px] font-medium tabular-nums', tierColor(afterTier, 'text'))}
        >
          {alert.spsAfter}
        </span>
      </div>
      <p className="mb-3 text-[11px] text-dl-muted">{getTierChangeLabel(alert)}</p>

      <div className="mb-3 flex gap-2">
        <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-dl-teal" aria-hidden />
        <p className="text-[12px] leading-relaxed text-dl-muted">{aiReason}</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {pills.map(pill => (
          <span
            key={pill}
            className="rounded-full bg-dl-teal/10 px-2 py-0.5 text-[10px] text-dl-muted"
          >
            {pill}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/packages/${alert.packageId}`}
          className="text-[12px] font-medium text-dl-teal hover:underline"
        >
          View package →
        </Link>
        <button type="button" className="btn-dash-secondary px-3 py-1.5 text-[12px]">
          Open in JIRA
        </button>
        <button
          type="button"
          className="text-[12px] text-dl-hint transition-colors hover:text-dl-muted"
        >
          Mark resolved
        </button>
      </div>
    </article>
  )
}
