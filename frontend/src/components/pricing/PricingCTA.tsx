'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { inViewOptions, sectionReveal } from '@/components/marketing/motion'

export function PricingCTA() {
  return (
    <section className="section-dark px-6 py-20">
      <motion.div
        className="mx-auto max-w-[640px] text-center"
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
        variants={sectionReveal}
      >
        <h2 className="text-[28px] font-medium text-white">Still have questions?</h2>
        <p className="mt-3 text-white/75">
          Our team responds within one business day. Or start free and explore on your own.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="mailto:hello@beacon.com" className="btn-secondary">
            Talk to sales
          </a>
          <Link href="/register" className="btn-primary">
            Start free
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
