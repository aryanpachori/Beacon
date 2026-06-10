import { cn } from '@/lib/utils'

export type MarketingTier = 'critical' | 'at-risk' | 'watch' | 'healthy'

const TIER_CLASS: Record<MarketingTier, string> = {
  critical: 'tier-chip-critical',
  'at-risk': 'tier-chip-risk',
  watch: 'tier-chip-watch',
  healthy: 'tier-chip-healthy',
}

const TIER_LABEL: Record<MarketingTier, string> = {
  critical: 'Critical',
  'at-risk': 'At risk',
  watch: 'Watch',
  healthy: 'Healthy',
}

interface MarketingTierChipProps {
  tier: MarketingTier
  className?: string
}

export function MarketingTierChip({ tier, className }: MarketingTierChipProps) {
  return (
    <span className={cn('tier-chip', TIER_CLASS[tier], className)}>
      {TIER_LABEL[tier]}
    </span>
  )
}
