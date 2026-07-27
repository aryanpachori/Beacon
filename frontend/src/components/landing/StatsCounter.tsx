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
  { label: 'Diffs reviewed', value: 340000, suffix: '+', prefix: '' },
  { label: 'Issues caught pre-commit', value: 96, suffix: '%', prefix: '' },
  { label: 'Median review time', value: 400, suffix: 'ms', prefix: '< ' },
  { label: 'Install time', value: 60, suffix: 's', prefix: '< ' },
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
    <section className="border-y border-dl-border bg-dl-page py-14 px-6">
      <motion.div
        className="mx-auto max-w-[1100px]"
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
        variants={staggerContainer}
      >
        <motion.div
          variants={sectionReveal}
          className="grid grid-cols-2 gap-y-10 md:grid-cols-4 md:divide-x md:divide-dl-border"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col px-6 first:pl-0 md:text-left">
              <span className="font-serif text-[32px] italic text-dl-navy md:text-[38px]">
                <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </span>
              <span className="mt-1.5 text-[13px] text-dl-muted">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
