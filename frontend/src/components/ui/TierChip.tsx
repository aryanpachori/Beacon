import type { Tier } from '@/types'
import { tierColor, TIER_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface TierChipProps {
  tier: Tier
  className?: string
}

export function TierChip({ tier, className }: TierChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        tierColor(tier, 'text'),
        'bg-white/5 border',
        tierColor(tier, 'border'),
        'border-opacity-40',
        className
      )}
    >
      {TIER_LABELS[tier]}
    </span>
  )
}
