import { tierColor } from '@/lib/constants'
import { spsToTier } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface SPSBadgeProps {
  sps: number
  size?: 'sm' | 'lg'
  className?: string
}

export function SPSBadge({ sps, size = 'sm', className }: SPSBadgeProps) {
  const tier = spsToTier(sps)
  const textClass = tierColor(tier, 'text')

  return (
    <span
      className={cn(
        'font-mono font-medium tabular-nums',
        size === 'lg' ? 'text-3xl' : 'text-sm',
        textClass,
        className
      )}
    >
      {sps}
    </span>
  )
}
