'use client'

import { motion } from 'framer-motion'
import { inViewOptions, sectionReveal } from '@/components/marketing/motion'

type BillingPeriod = 'monthly' | 'annual'

type PricingHeroProps = {
  billingPeriod: BillingPeriod
  onBillingChange: (period: BillingPeriod) => void
}

export function PricingHero({ billingPeriod, onBillingChange }: PricingHeroProps) {
  return (
    <section className="section-dark px-6 pb-20 pt-[100px]">
      <motion.div
        className="mx-auto max-w-[800px] text-center"
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
        variants={sectionReveal}
      >
        <p className="label-overline text-dl-sage">Pricing</p>
        <h1 className="mt-4 text-[36px] font-medium text-dl-cream md:text-[44px]">
          Simple pricing. No surprises.
        </h1>
        <p className="mx-auto mt-4 max-w-[520px] text-base text-dl-sage-light/65">
          Start free on one repo. Upgrade when your team is ready. Cancel anytime.
        </p>

        <motion.div
          variants={sectionReveal}
          className="mt-8 inline-flex rounded-lg bg-white/5 p-1"
        >
          <button
            type="button"
            onClick={() => onBillingChange('monthly')}
            className={`rounded-md px-5 py-2 text-sm font-medium transition-colors ${
              billingPeriod === 'monthly'
                ? 'bg-dl-teal text-white'
                : 'text-dl-sage-light/70 hover:text-dl-cream'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => onBillingChange('annual')}
            className={`flex items-center gap-2 rounded-md px-5 py-2 text-sm font-medium transition-colors ${
              billingPeriod === 'annual'
                ? 'bg-dl-teal text-white'
                : 'text-dl-sage-light/70 hover:text-dl-cream'
            }`}
          >
            Annual
            <span className="rounded-full bg-dl-sage-light px-2 py-0.5 text-[10px] font-medium text-dl-nav">
              Save 20%
            </span>
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}
