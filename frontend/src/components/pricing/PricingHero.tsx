'use client'

import { motion } from 'framer-motion'
import { inViewOptions, sectionReveal } from '@/components/marketing/motion'

export function PricingHero() {
  return (
    <section className="section-dark px-6 pb-16 pt-[100px] md:pb-20">
      <motion.div
        className="mx-auto max-w-[800px] text-center"
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
        variants={sectionReveal}
      >
        <p className="label-overline">Pricing</p>
        <h1 className="mt-4 text-[36px] font-medium text-white md:text-[44px]">
          Simple pricing. No surprises.
        </h1>
        <p className="mx-auto mt-4 max-w-[520px] text-base text-white/75">
          Start free on one repo. Upgrade when your team is ready. Cancel anytime.
        </p>
      </motion.div>
    </section>
  )
}
