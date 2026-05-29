'use client'

import type { Tier } from '@/types'
import { cn } from '@/lib/utils'

const TIER_SPARKLINE_FILL: Record<Tier, string> = {
  critical: 'tier-bar-fill-critical',
  'at-risk': 'tier-bar-fill-at-risk',
  watch: 'tier-bar-fill-watch',
  healthy: 'tier-bar-fill-healthy',
}

interface SparklineBarProps {
  data: number[]
  tier: Tier
  bars?: number
}

export function SparklineBar({ data, tier, bars = 5 }: SparklineBarProps) {
  const slice = data.slice(-bars)
  const max = Math.max(...slice, 1)
  const fillClass = TIER_SPARKLINE_FILL[tier]

  return (
    <div className="flex h-7 items-end gap-0.5">
      {slice.map((v, i) => (
        <div
          key={i}
          className={cn('w-1.5 min-h-[4px] rounded-sm', fillClass)}
          style={{ height: `${Math.max(12, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  )
}
