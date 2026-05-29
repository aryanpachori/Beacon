import type { Tier } from '@/types'

const colourMap: Record<Tier, string> = {
  healthy: 'text-[#5BBEC8]',
  watch: 'text-[#8AB870]',
  'at-risk': 'text-[#D4963A]',
  critical: 'text-[#E07070]',
}

interface SPSBadgeProps {
  score: number
  tier: Tier
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = { sm: 'text-[16px]', md: 'text-[22px]', lg: 'text-[32px]' }

export function SPSBadge({ score, tier, size = 'md' }: SPSBadgeProps) {
  return (
    <span className={`font-medium tabular-nums ${sizeMap[size]} ${colourMap[tier]}`}>
      {score}
    </span>
  )
}
