'use client'

import { LineChart, Line, ResponsiveContainer } from 'recharts'
import type { Tier } from '@/types'

const TIER_STROKE: Record<Tier, string> = {
  critical: 'var(--dl-critical)',
  'at-risk': 'var(--dl-risk)',
  watch:    'var(--dl-watch)',
  healthy:  'var(--dl-healthy)',
}

interface SparklineLineProps {
  data: number[]      // expects last 30 values of spsHistory
  tier: Tier
  width?: number
  height?: number
}

export function SparklineLine({ data, tier, width = 80, height = 28 }: SparklineLineProps) {
  const chartData = data.map((v, i) => ({ i, v }))
  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={TIER_STROKE[tier]}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
