'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { inViewOptions, sectionReveal, staggerContainer } from '@/components/marketing/motion'

interface Stat {
  label: string
  value: number
  suffix: string
  prefix: string
}

const STATS: Stat[] = [
  { label: 'Packages Scanned', value: 12400, suffix: '+', prefix: '' },
  { label: 'Abandonments Predicted', value: 47, suffix: '', prefix: '' },
  { label: 'Prediction Accuracy', value: 92, suffix: '%', prefix: '' },
  { label: 'Setup Time', value: 60, suffix: 's', prefix: '< ' },
]

function AnimatedNumber({ value, prefix, suffix }: { value: number; prefix: string; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { stiffness: 80, damping: 30 })
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [isInView, motionValue, value])

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayed(Math.round(latest))
    })
    return unsubscribe
  }, [springValue])

  return (
    <span ref={ref}>
      {prefix}{displayed.toLocaleString()}{suffix}
    </span>
  )
}

export function StatsCounter() {
  return (
    <section className="border-y border-dl-border bg-dl-page py-16 px-6">
      <motion.div
        className="mx-auto max-w-[1100px]"
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
        variants={staggerContainer}
      >
        <motion.div
          variants={sectionReveal}
          className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-0 md:divide-x md:divide-dl-border"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center px-6">
              <span className="text-[36px] font-semibold tracking-tight text-dl-teal md:text-[42px]">
                <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </span>
              <span className="mt-2 text-[13px] font-medium text-dl-muted">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
