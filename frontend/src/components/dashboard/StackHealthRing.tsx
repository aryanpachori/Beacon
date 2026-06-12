'use client'

import { useEffect } from 'react'
import { useMotionValue, useTransform, animate, motion } from 'framer-motion'

interface StackHealthRingProps {
  percentage: number
  strokeColor: string
}

const SIZE = 120
const STROKE = 8
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function StackHealthRing({ percentage, strokeColor }: StackHealthRingProps) {
  const progress = useMotionValue(0)
  const strokeDashoffset = useTransform(
    progress,
    v => CIRCUMFERENCE - (v / 100) * CIRCUMFERENCE
  )

  useEffect(() => {
    const controls = animate(progress, percentage, { duration: 1, ease: 'easeOut' })
    return controls.stop
  }, [percentage, progress])

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#e4e8ee"
          strokeWidth={STROKE}
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={strokeColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          style={{ strokeDashoffset }}
        />
      </svg>
      <div className="absolute flex flex-col items-center text-center">
        <span className="text-[22px] font-medium tabular-nums" style={{ color: strokeColor }}>
          {percentage}%
        </span>
        <span className="text-[11px] text-[#9fa0b5]">healthy</span>
      </div>
    </div>
  )
}
