'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { inViewOptions, staggerContainer, sectionReveal } from '@/components/marketing/motion'
import { formatInr, PRO_PLAN_PRICE_INR } from '@/lib/billing'

export type BillingPeriod = 'monthly' | 'annual'

type PricingCardsProps = {
  billingPeriod: BillingPeriod
  onBillingChange: (period: BillingPeriod) => void
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 0,
    priceLabel: formatInr(0),
    tagline: 'Forever free.',
    cta: 'Get started free',
    ctaClass: 'btn-secondary w-full justify-center',
    href: '/register',
    popular: false,
    features: [
      '1 repo',
      'Up to 200 packages',
      'Weekly digest email',
      'SPS scores for all packages',
      '7-day score history',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: PRO_PLAN_PRICE_INR,
    tagline: 'For individual engineers and small teams.',
    cta: 'Upgrade to Pro',
    ctaClass: 'btn-primary w-full justify-center',
    popular: true,
    features: [
      '5 repos',
      'Up to 2,000 packages',
      'Slack + email alerts',
      'Migration recommendations',
      '90-day score history',
      'npm + PyPI ecosystems',
    ],
  },
]

export function PricingCards({ billingPeriod, onBillingChange }: PricingCardsProps) {
  return (
    <section className="section-light px-6 pb-20 pt-12 md:pt-16">
      <motion.div
        className="mx-auto flex max-w-[720px] flex-col gap-16 md:gap-20"
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
        variants={staggerContainer}
      >
        <motion.div variants={sectionReveal} className="flex justify-center">
          <div
            className="inline-flex rounded-lg border border-dl-border bg-dl-surface p-1 shadow-sm"
            role="group"
            aria-label="Billing period"
          >
            <button
              type="button"
              onClick={() => onBillingChange('monthly')}
              className={`rounded-md px-5 py-2 text-sm font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-dl-teal text-white'
                  : 'text-neutral-600 hover:text-dl-text'
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
                  : 'text-neutral-600 hover:text-dl-text'
              }`}
            >
              Annual
              <span className="rounded-full bg-dl-sage-light px-2 py-0.5 text-[10px] font-medium text-dl-nav">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          variants={staggerContainer}
        >
          {PLANS.map((plan) => {
            const monthlyDisplay =
              plan.monthlyPrice === 0
                ? plan.priceLabel
                : billingPeriod === 'annual'
                  ? formatInr(Math.round(plan.monthlyPrice * 0.8))
                  : formatInr(plan.monthlyPrice)

            return (
              <motion.div
                key={plan.id}
                variants={sectionReveal}
                className={`relative rounded-2xl border border-dl-border bg-dl-card p-7 ${
                  plan.popular ? 'border-t-[3px] border-t-dl-teal' : ''
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-0.5 text-[11px] font-medium text-white">
                    Coming Soon
                  </span>
                )}
                <p className="text-[13px] font-medium uppercase tracking-wide text-dl-forest">
                  {plan.name}
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${plan.id}-${monthlyDisplay}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[40px] font-medium leading-none text-dl-text"
                    >
                      {monthlyDisplay}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-sm text-neutral-600">/month</span>
                </div>
                <p className="mt-2 text-[13px] text-neutral-600">{plan.tagline}</p>
                {plan.id === 'pro' ? (
                  <>
                    <button
                      disabled
                      className="mt-6 flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-indigo-100 px-5 py-2.5 text-sm font-semibold text-indigo-400"
                    >
                      Coming Soon
                    </button>
                    <p className="mt-2 text-center text-[11px] text-neutral-500">
                      Pro launches soon — join free now
                    </p>
                  </>
                ) : (
                  <Link href={plan.href!} className={`mt-6 ${plan.ctaClass}`}>
                    {plan.cta}
                  </Link>
                )}
                <ul className="mt-4 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-[13px] text-dl-forest"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dl-teal" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>
    </section>
  )
}
