'use client'

import { useState } from 'react'
import { Gift, ExternalLink, CalendarClock, Check, X } from 'lucide-react'

// ── Plan expiration config ───────────────────────────────────
const PLAN_START = new Date('2026-05-11')
const PLAN_END   = new Date('2026-06-11')

function getDaysRemaining() {
  const now = new Date()
  const diff = PLAN_END.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / 86_400_000))
}

function getElapsedPercent() {
  const total = PLAN_END.getTime() - PLAN_START.getTime()
  const elapsed = Date.now() - PLAN_START.getTime()
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// ── Plans data (sourced from landing page pricing) ───────────
const CURRENT_PLAN_ID = 'pro'

type BillingPeriod = 'monthly' | 'annual'

interface Plan {
  id: string
  name: string
  monthlyPrice: number
  priceSuffix: string
  tagline: string
  cta: string
  features: string[]
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 0,
    priceSuffix: '/mo.',
    tagline: 'Forever free for individual developers getting started.',
    cta: 'Choose plan',
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
    monthlyPrice: 15,
    priceSuffix: '/mo.',
    tagline: 'For individual engineers and small teams.',
    cta: 'Choose plan',
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
    id: 'ultra',
    name: 'Ultra',
    monthlyPrice: 49,
    priceSuffix: '/mo.',
    tagline: 'Get maximum value with unlimited scans and priority access.',
    cta: 'Choose plan',
    features: [
      'Everything in Pro',
      'Unlimited repos',
      'Unlimited packages',
      'All ecosystems (npm, PyPI, Maven, Crates)',
      'Priority access to new features',
      'Highest throughput and limits',
    ],
  },
  {
    id: 'teams',
    name: 'Teams',
    monthlyPrice: 25,
    priceSuffix: '/user/mo.',
    tagline: 'Everything on Individual, plus:',
    cta: 'Get Teams',
    features: [
      'Shared team dashboard with org-wide context',
      'Team-wide alert rules and automations',
      'Security review workflows',
      'SSO + enforced team-level privacy mode',
      'Team plugin marketplace',
      'Usage analytics',
      'Centralised team billing',
    ],
  },
]

function getPrice(plan: Plan, period: BillingPeriod) {
  if (plan.monthlyPrice === 0) return 0
  if (period === 'annual') return Math.round(plan.monthlyPrice * 0.8)
  return plan.monthlyPrice
}


// ── Adjust Plan Modal ────────────────────────────────────────
function AdjustPlanModal({ onClose }: { onClose: () => void }) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-[920px] max-h-[90vh] overflow-y-auto rounded-2xl mx-4"
        style={{
          background: '#0a1614',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-dl-muted transition-colors hover:bg-white/5 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-8 pt-8 pb-6">
          {/* Heading */}
          <h2 className="text-center text-2xl font-semibold text-dl-forest mb-5">
            Adjust your plan
          </h2>

          {/* Billing toggle */}
          <div className="flex justify-center mb-2">
            <div
              className="inline-flex rounded-lg p-1"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`rounded-md px-5 py-2 text-[13px] font-medium transition-all duration-200 ${
                  billingPeriod === 'monthly'
                    ? 'bg-dl-teal/20 text-dl-teal'
                    : 'text-dl-muted hover:text-dl-forest'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`rounded-md px-5 py-2 text-[13px] font-medium transition-all duration-200 ${
                  billingPeriod === 'annual'
                    ? 'bg-dl-teal/20 text-dl-teal'
                    : 'text-dl-muted hover:text-dl-forest'
                }`}
              >
                Annual
              </button>
            </div>
          </div>

          {/* Save badge */}
          <div className="flex justify-center mb-6">
            <span className="rounded-full bg-dl-sage-light/15 px-3 py-1 text-[11px] font-semibold text-dl-sage-light">
              Save 20% when billed annually
            </span>
          </div>

          {/* Plan cards grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => {
              const isCurrent = plan.id === CURRENT_PLAN_ID
              const price = getPrice(plan, billingPeriod)

              return (
                <div
                  key={plan.id}
                  className="flex flex-col rounded-xl p-5 transition-all duration-200"
                  style={{
                    background: isCurrent
                      ? 'rgba(53,133,142,0.06)'
                      : 'rgba(255,255,255,0.02)',
                    border: isCurrent
                      ? '1px solid rgba(53,133,142,0.25)'
                      : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Plan name + current badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[15px] font-semibold text-dl-forest">{plan.name}</span>
                    {isCurrent && (
                      <span
                        className="rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.10)',
                          color: '#9ab8a8',
                        }}
                      >
                        Current plan
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-[28px] font-bold leading-none text-dl-forest">
                      ${price}
                    </span>
                    <span className="text-[12px] text-dl-muted">{plan.priceSuffix}</span>
                  </div>

                  {/* Tagline */}
                  <p className="text-[12px] text-dl-muted leading-relaxed mb-4 min-h-[36px]">
                    {plan.tagline}
                  </p>

                  {/* Features */}
                  <ul className="flex flex-col gap-2 mb-5 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-[12px] text-dl-muted leading-relaxed">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-dl-teal" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <div
                      className="mt-auto w-full rounded-lg py-2.5 text-center text-[12px] font-medium"
                      style={{
                        color: '#5a7a6a',
                        border: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(255,255,255,0.02)',
                      }}
                    >
                      Your current plan
                    </div>
                  ) : (
                    <button
                      className="mt-auto w-full rounded-lg py-2.5 text-[12px] font-semibold text-white transition-all duration-200 hover:brightness-110"
                      style={{
                        background: 'linear-gradient(135deg, #35858E, #2a6e6e)',
                      }}
                    >
                      {plan.cta}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <p className="text-center text-[12px] text-dl-hint mt-6">
            Need more capabilities for your business?{' '}
            <a href="#" className="text-dl-teal underline underline-offset-2 hover:text-dl-sage-light transition-colors">
              Learn more about our Enterprise plans.
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}


// ── Billing Page ─────────────────────────────────────────────
export default function BillingPage() {
  const daysLeft = getDaysRemaining()
  const elapsed  = getElapsedPercent()
  const [showAdjust, setShowAdjust] = useState(false)

  return (
    <div className="app-page">

      {/* ── Page heading ── */}
      <div className="mb-8">
        <h1 className="page-heading text-dl-forest">Billing &amp; Invoices</h1>
      </div>

      {/* ── Annual billing banner ── */}
      <div
        className="mb-6 flex items-center justify-between rounded-xl px-5 py-3.5"
        style={{
          background: 'linear-gradient(135deg, rgba(53,133,142,0.12) 0%, rgba(74,122,48,0.10) 100%)',
          border: '1px solid rgba(53,133,142,0.22)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <Gift className="h-4 w-4 text-dl-sage-light" />
          <span className="text-[13px] font-medium text-dl-sage-light">
            Switch to annual billing and save 20%
          </span>
        </div>
        <button
          onClick={() => setShowAdjust(true)}
          className="rounded-lg border border-dl-teal/40 bg-dl-teal/10 px-4 py-1.5 text-[12px] font-semibold text-dl-teal transition-all duration-200 hover:bg-dl-teal/20 hover:border-dl-teal/60"
        >
          Upgrade Now
        </button>
      </div>

      {/* ── Plan card ── */}
      <div
        className="mb-5 rounded-xl px-6 py-5"
        style={{
          background: '#0e1e1c',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-[17px] font-bold text-dl-teal">Pro</span>
              <span className="text-[13px] text-dl-muted">$20 /mo.</span>
            </div>
            <p className="text-[13px] text-dl-muted leading-relaxed max-w-lg">
              Entry-level plan with access to premium health signals, unlimited package scans, and more.
            </p>
            <p className="text-[12px] text-dl-hint mt-1">
              Your subscription will auto renew on {formatDate(PLAN_END)}.
            </p>
          </div>
          <button
            onClick={() => setShowAdjust(true)}
            className="shrink-0 rounded-lg border border-dl-m-border bg-transparent px-4 py-1.5 text-[12px] font-semibold text-dl-forest transition-all duration-200 hover:bg-white/5 hover:border-dl-teal/30"
          >
            Adjust plan
          </button>
        </div>
      </div>

      {/* ── Payment card ── */}
      <div
        className="mb-5 rounded-xl px-6 py-5"
        style={{
          background: '#0e1e1c',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[15px] font-semibold text-dl-forest">Payment</span>
            <span className="text-[13px] text-dl-muted">Update your payment details</span>
          </div>
          <button
            className="flex items-center gap-1.5 shrink-0 rounded-lg border border-dl-m-border bg-transparent px-4 py-1.5 text-[12px] font-semibold text-dl-forest transition-all duration-200 hover:bg-white/5 hover:border-dl-teal/30"
          >
            Manage in Stripe
            <ExternalLink className="h-3 w-3 text-dl-muted" />
          </button>
        </div>
      </div>

      {/* ── Plan expiration ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: '#0e1e1c',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="px-6 pt-5 pb-5 flex flex-col gap-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CalendarClock className="h-4.5 w-4.5 text-dl-teal" />
              <span className="text-[15px] font-semibold text-dl-forest">Current Billing Cycle</span>
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
              style={{
                background: daysLeft <= 5 ? 'rgba(192,48,48,0.15)' : 'rgba(53,133,142,0.15)',
                color: daysLeft <= 5 ? '#e07070' : '#5bbec8',
                border: `1px solid ${daysLeft <= 5 ? 'rgba(192,48,48,0.30)' : 'rgba(53,133,142,0.25)'}`,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: daysLeft <= 5 ? '#e07070' : '#5bbec8' }}
              />
              {daysLeft === 0 ? 'Expired' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`}
            </span>
          </div>

          {/* Date range + progress bar */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-dl-muted">{formatDate(PLAN_START)}</span>
              <span className="text-[12px] text-dl-muted">{formatDate(PLAN_END)}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${elapsed}%`,
                  background: elapsed >= 85
                    ? 'linear-gradient(90deg, #35858E, #C47820, #C03030)'
                    : 'linear-gradient(90deg, #35858E, #4A7A30)',
                }}
              />
            </div>
            <p className="text-[11px] text-dl-hint">
              {elapsed}% of your billing cycle has elapsed. Your plan will automatically renew unless cancelled.
            </p>
          </div>

          {/* Details grid */}
          <div
            className="grid grid-cols-3 gap-4 rounded-lg px-5 py-4"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-dl-muted">Started</span>
              <span className="text-[13px] font-medium text-dl-forest">{formatDate(PLAN_START)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-dl-muted">Renews</span>
              <span className="text-[13px] font-medium text-dl-forest">{formatDate(PLAN_END)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-dl-muted">Next charge</span>
              <span className="text-[13px] font-medium text-dl-teal">$20.00</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Cancel Subscription ── */}
      <div
        className="mt-5 rounded-xl px-6 py-5"
        style={{
          background: '#0e1e1c',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[15px] font-semibold text-dl-forest">Cancel Subscription</span>
            <span className="text-[13px] text-dl-muted">We are sad to see you leave. Let us know if we can improve our service.</span>
          </div>
          <button
            className="shrink-0 rounded-lg border border-dl-critical/30 bg-transparent px-4 py-1.5 text-[12px] font-semibold text-dl-critical transition-all duration-200 hover:bg-dl-critical/10 hover:border-dl-critical/50"
            onClick={() => {
              if (window.confirm("Are you sure you want to cancel your subscription?")) {
                alert("Subscription cancelled successfully.");
              }
            }}
          >
            Cancel Subscription
          </button>
        </div>
      </div>

      {/* ── Adjust Plan Modal ── */}
      {showAdjust && <AdjustPlanModal onClose={() => setShowAdjust(false)} />}
    </div>
  )
}
