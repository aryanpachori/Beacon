'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { inViewOptions, staggerContainer, sectionReveal } from '@/components/marketing/motion'

export type BillingPeriod = 'monthly' | 'annual'

type PricingCardsProps = {
  billingPeriod: BillingPeriod
  onBillingChange: (period: BillingPeriod) => void
}

function formatPrice(monthly: number, billingPeriod: BillingPeriod) {
  if (billingPeriod === 'annual') {
    const annualMonthly = Math.round(monthly * 0.8)
    return { amount: annualMonthly, suffix: '/month' }
  }
  return { amount: monthly, suffix: '/month' }
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 0,
    priceLabel: '$0',
    tagline: 'Forever free.',
    cta: 'Get started free',
    ctaClass: 'btn-secondary w-full justify-center',
    href: '/register',
    popular: false,
    dark: false,
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
    monthlyPrice: 49,
    tagline: 'For individual engineers and small teams.',
    cta: 'Start Pro trial',
    ctaClass: 'btn-primary w-full justify-center',
    href: '/register',
    popular: false,
    dark: false,
    features: [
      '5 repos',
      'Up to 2,000 packages',
      'Slack + email alerts',
      'Migration recommendations',
      '90-day score history',
      'npm + PyPI ecosystems',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    monthlyPrice: 199,
    tagline: 'For platform and DevSecOps teams.',
    cta: 'Start Team trial',
    ctaClass: 'btn-primary w-full justify-center',
    href: '/register',
    popular: true,
    dark: false,
    features: [
      '25 repos',
      'Up to 20,000 packages',
      'JIRA + Linear integration',
      'REST API access',
      '3 team seats',
      'go.mod + Cargo.toml',
      'Compliance CSV export',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: null,
    priceLabel: 'Custom',
    tagline: 'For organizations with security and compliance requirements.',
    cta: 'Talk to sales',
    ctaClass: 'btn-ghost w-full justify-center',
    href: 'mailto:hello@driftlogg.com?subject=Enterprise%20plan',
    popular: false,
    dark: true,
    features: [
      'Unlimited repos',
      'Unlimited packages',
      'Private registry support',
      'SSO + SAML',
      'SLA-backed alerting',
      'SOC 2 report',
      'Custom seats',
      'Dedicated CSM',
    ],
  },
]

export function PricingCards({ billingPeriod, onBillingChange }: PricingCardsProps) {
  return (
    <section className="section-light px-6 pb-20 pt-12 md:pt-16">
      <motion.div
        className="mx-auto flex max-w-[1100px] flex-col gap-16 md:gap-20"
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
        variants={staggerContainer}
      >
        <motion.div variants={sectionReveal} className="flex justify-center">
          <motion.div
            variants={sectionReveal}
            className="inline-flex rounded-lg border border-dl-border bg-dl-cream p-1 shadow-sm"
            role="group"
            aria-label="Billing period"
          >
          <button
            type="button"
            onClick={() => onBillingChange('monthly')}
            className={`rounded-md px-5 py-2 text-sm font-medium transition-colors ${
              billingPeriod === 'monthly'
                ? 'bg-dl-teal text-white'
                : 'text-dl-muted hover:text-dl-text'
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
                : 'text-dl-muted hover:text-dl-text'
            }`}
          >
            Annual
            <span className="rounded-full bg-dl-sage-light px-2 py-0.5 text-[10px] font-medium text-dl-nav">
              Save 20%
            </span>
          </button>
          </motion.div>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainer}
        >
          {PLANS.map((plan) => {
          const price =
            plan.monthlyPrice === null
              ? null
              : formatPrice(plan.monthlyPrice, billingPeriod)

          return (
            <motion.div
              key={plan.id}
              variants={sectionReveal}
              className={`relative rounded-2xl border p-7 ${
                plan.dark
                  ? 'border-dl-sage-light/15 bg-dl-nav'
                  : 'border-dl-border bg-dl-card'
              } ${plan.popular ? 'border-t-[3px] border-t-dl-teal' : ''}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-dl-teal px-3 py-0.5 text-[11px] font-medium text-white">
                  Most popular
                </span>
              )}
              <p
                className={`text-[13px] font-medium uppercase tracking-wide ${
                  plan.dark ? 'text-dl-sage-light/70' : 'text-dl-forest/75'
                }`}
              >
                {plan.name}
              </p>
              <div className="mt-3 flex items-baseline gap-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={price ? `${plan.id}-${price.amount}` : plan.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`text-[40px] font-medium leading-none ${
                      plan.dark ? 'text-dl-cream' : 'text-dl-text'
                    }`}
                  >
                    {price
                      ? `$${price.amount}`
                      : 'priceLabel' in plan
                        ? plan.priceLabel
                        : 'Custom'}
                  </motion.span>
                </AnimatePresence>
                {price && (
                  <span className={`text-sm ${plan.dark ? 'text-dl-sage-light/50' : 'text-dl-muted'}`}>
                    {price.suffix}
                  </span>
                )}
              </div>
              <p
                className={`mt-2 text-[13px] ${
                  plan.dark ? 'text-dl-sage-light/65' : 'text-dl-hint'
                }`}
              >
                {plan.tagline}
              </p>
              <Link href={plan.href} className={`mt-6 ${plan.ctaClass}`}>
                {plan.cta}
              </Link>
              <ul className="mt-6 space-y-2.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={`flex items-start gap-2 text-[13px] ${
                      plan.dark ? 'text-dl-sage-light/70' : 'text-dl-forest'
                    }`}
                  >
                    <Check
                      className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                        plan.dark ? 'text-dl-sage-light/40' : 'text-dl-teal'
                      }`}
                    />
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
