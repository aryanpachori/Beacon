'use client'

import { motion } from 'framer-motion'
import { inViewOptions } from '@/components/marketing/motion'

/* Each "logo" is rendered as a stylised wordmark with distinctive typography */
const COMPANIES = [
  { name: 'Acme Corp', style: 'font-bold tracking-[0.15em] uppercase text-[14px]' },
  { name: 'BuildCo', style: 'font-semibold italic tracking-tight text-[15px]' },
  { name: 'ShipFast', style: 'font-black tracking-[-0.02em] text-[15px]' },
  { name: 'Stackery', style: 'font-light tracking-[0.08em] uppercase text-[13px]' },
  { name: 'DevHQ', style: 'font-mono font-bold tracking-wider text-[14px]' },
]

export function SocialProof() {
  return (
    <section className="border-y border-dl-border bg-dl-card py-8">
      <motion.div
        className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-6 md:flex-row md:justify-between"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={inViewOptions}
        transition={{ duration: 0.4 }}
      >
        <p className="shrink-0 text-[13px] text-dl-hint">Trusted by engineering teams at</p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {COMPANIES.map(({ name, style }) => (
            <span
              key={name}
              className={`text-dl-forest/25 transition-all duration-300 hover:text-dl-forest/50 ${style}`}
            >
              {name}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
