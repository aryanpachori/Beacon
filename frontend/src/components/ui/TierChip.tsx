import type { Tier } from '@/types'
import { TIER_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const TIER_CLASS: Record<Tier, string> = {
  critical: 'tier-chip-critical',
  'at-risk': 'tier-chip-risk',
  watch: 'tier-chip-watch',
  healthy: 'tier-chip-healthy',
}

interface TierChipProps {
  tier: Tier
  className?: string
}

export function TierChip({ tier, className }: TierChipProps) {
  return (
    <span className={cn(TIER_CLASS[tier], className)}>
      {TIER_LABELS[tier]}
    </span>
  )
}
