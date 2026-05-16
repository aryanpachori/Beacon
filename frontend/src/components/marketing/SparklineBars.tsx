import { cn } from '@/lib/utils'

export type SparklineTrend = 'declining' | 'flat' | 'rising'

const TREND_HEIGHTS: Record<SparklineTrend, number[]> = {
  declining: [18, 14, 11, 8, 5],
  flat: [12, 12, 11, 12, 12],
  rising: [6, 9, 12, 15, 18],
}

interface SparklineBarsProps {
  trend: SparklineTrend
  color: string
  className?: string
}

export function SparklineBars({ trend, color, className }: SparklineBarsProps) {
  const heights = TREND_HEIGHTS[trend]
  return (
    <svg
      width={60}
      height={24}
      viewBox="0 0 60 24"
      className={cn('inline-block', className)}
      aria-hidden
    >
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 12 + 2}
          y={24 - h}
          width={8}
          height={h}
          rx={1}
          fill={color}
          opacity={0.85}
        />
      ))}
    </svg>
  )
}
