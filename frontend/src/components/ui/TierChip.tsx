import type { Tier } from '@/types'

const classMap: Record<Tier, string> = {
  healthy: 'tier-chip tier-chip-healthy',
  watch: 'tier-chip tier-chip-watch',
  'at-risk': 'tier-chip tier-chip-risk',
  critical: 'tier-chip tier-chip-critical',
}

const labelMap: Record<Tier, string> = {
  healthy: 'Healthy',
  watch: 'Watch',
  'at-risk': 'At risk',
  critical: 'Critical',
}

export function TierChip({ tier }: { tier: Tier }) {
  return <span className={classMap[tier]}>{labelMap[tier]}</span>
}
