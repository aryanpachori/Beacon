'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, CreditCard, Loader2 } from 'lucide-react'
import { RazorpayUpgradeButton } from '@/components/billing/RazorpayUpgradeButton'
import { useRazorpayCheckout } from '@/hooks/useRazorpayCheckout'
import { fetchBillingPlan, type BillingPlanResponse } from '@/lib/api'
import { formatInr, PRO_PLAN_PRICE_INR } from '@/lib/billing'
import { useAppData } from '@/context/AppDataContext'

const PRO_FEATURES = [
  '5 repos',
  'Up to 2,000 packages',
  'Slack + email alerts',
  'Migration recommendations',
  '90-day score history',
  'npm + PyPI ecosystems',
]

const STARTER_FEATURES = [
  '1 repo',
  'Up to 200 packages',
  'Weekly digest email',
  'SPS scores for all packages',
  '7-day score history',
]

export default function BillingPage() {
  const router = useRouter()
  const { user, refresh } = useAppData()
  const [billing, setBilling] = useState<BillingPlanResponse | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const autoCheckoutStarted = useRef(false)
  const { startCheckout, loading: checkoutLoading } = useRazorpayCheckout()

  const loadPlan = useCallback(async () => {
    setLoadingPlan(true)
    try {
      const plan = await fetchBillingPlan()
      setBilling(plan)
    } finally {
      setLoadingPlan(false)
    }
  }, [])

  useEffect(() => {
    void loadPlan()
  }, [loadPlan])

  const isPro = (billing?.plan ?? user?.plan) === 'pro'

  const onPaymentSuccess = useCallback(async () => {
    setSuccessMessage('Payment successful — you are now on Pro.')
    await Promise.all([loadPlan(), refresh()])
    router.replace('/billing')
  }, [loadPlan, refresh, router])

  useEffect(() => {
    if (autoCheckoutStarted.current || loadingPlan || isPro) return
    const upgrade = new URLSearchParams(window.location.search).get('upgrade')
    if (upgrade !== 'pro') return

    autoCheckoutStarted.current = true
    void startCheckout({
      email: billing?.email ?? user?.email,
      name: billing?.fullName ?? user?.fullName ?? undefined,
      onSuccess: () => void onPaymentSuccess(),
    })
  }, [
    billing?.email,
    billing?.fullName,
    isPro,
    loadingPlan,
    onPaymentSuccess,
    startCheckout,
    user?.email,
    user?.fullName,
  ])

  if (loadingPlan) {
    return (
      <div className="app-page flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-dl-teal" />
      </div>
    )
  }

  return (
    <div className="app-page">
      <div className="mb-8">
        <h1 className="page-heading text-dl-forest">Billing</h1>
        <p className="mt-1 text-[13px] text-dl-muted">
          Manage your DriftLogg plan. Payments are processed securely via Razorpay.
        </p>
      </div>

      {successMessage && (
        <div
          className="mb-6 rounded-xl px-5 py-3.5 text-[13px] font-medium text-dl-sage-light"
          style={{
            background: 'rgba(74,122,48,0.15)',
            border: '1px solid rgba(74,122,48,0.35)',
          }}
        >
          {successMessage}
        </div>
      )}

      {/* Current plan */}
      <div
        className="mb-6 rounded-xl px-6 py-5 bg-white dark:bg-[#0d131f] border border-dl-border dark:border-blue-500/20"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-dl-muted">
              Current plan
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold capitalize text-dl-teal">
                {billing?.plan ?? user?.plan ?? 'starter'}
              </span>
              {!isPro && (
                <span className="text-[13px] text-dl-muted">Free</span>
              )}
              {isPro && (
                <span className="text-[13px] text-dl-muted">
                  {formatInr(PRO_PLAN_PRICE_INR)}/month
                </span>
              )}
            </div>
            <p className="mt-2 text-[13px] text-dl-muted">
              {isPro
                ? 'You have full Pro access — alerts, migrations, and extended history.'
                : 'Upgrade to Pro to unlock more repos, alerts, and migration recommendations.'}
            </p>
            <p className="mt-2 text-[12px] text-dl-hint">
              Limits: {billing?.repoLimit ?? 1} repo(s), up to{' '}
              {(billing?.packageLimit ?? 200).toLocaleString()} packages
            </p>
          </div>
          {!isPro && (
            <RazorpayUpgradeButton
              email={billing?.email ?? user?.email}
              name={billing?.fullName ?? user?.fullName ?? undefined}
              onSuccess={() => void onPaymentSuccess()}
              className="shrink-0 w-full sm:w-auto"
            />
          )}
        </div>
      </div>

      {/* Plan comparison */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PlanCard
          name="Starter"
          price={formatInr(0)}
          tagline="Forever free for individual developers."
          features={STARTER_FEATURES}
          isCurrent={!isPro}
          cta={null}
        />
        <PlanCard
          name="Pro"
          price={`${formatInr(PRO_PLAN_PRICE_INR)}/mo`}
          tagline="For engineers and small teams who need proactive alerts."
          features={PRO_FEATURES}
          isCurrent={isPro}
          highlighted
          cta={
            isPro ? (
              <span className="text-[12px] font-medium text-dl-muted">Your current plan</span>
            ) : (
              <RazorpayUpgradeButton
                email={billing?.email ?? user?.email}
                name={billing?.fullName ?? user?.fullName ?? undefined}
                onSuccess={() => void onPaymentSuccess()}
                label={`Pay ${formatInr(PRO_PLAN_PRICE_INR)} with Razorpay`}
                className="w-full justify-center"
                disabled={checkoutLoading}
              />
            )
          }
        />
      </div>

      {/* Payment info */}
      <div
        className="mt-6 rounded-xl px-6 py-5 bg-white dark:bg-[#0d131f] border border-dl-border dark:border-blue-500/20"
      >
        <div className="flex items-start gap-3">
          <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-dl-teal" />
          <div>
            <p className="text-[15px] font-semibold text-dl-forest">Razorpay checkout</p>
            <p className="mt-1 text-[13px] leading-relaxed text-dl-muted">
              Pro is billed at {formatInr(PRO_PLAN_PRICE_INR)} per month via Razorpay Standard
              Checkout. Use test card 4111 1111 1111 1111 with any future expiry and CVV in test
              mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlanCard({
  name,
  price,
  tagline,
  features,
  isCurrent,
  highlighted,
  cta,
}: {
  name: string
  price: string
  tagline: string
  features: string[]
  isCurrent: boolean
  highlighted?: boolean
  cta: React.ReactNode
}) {
  return (
    <div
      className={`flex flex-col rounded-xl p-6 border ${
        highlighted
          ? 'bg-dl-blue/5 border-dl-blue/20'
          : 'bg-white dark:bg-[#0d131f] border-dl-border dark:border-blue-500/20'
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[15px] font-semibold text-dl-forest">{name}</span>
        {isCurrent && (
          <span className="rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-dl-muted border border-dl-border dark:border-white/10 bg-dl-surface dark:bg-white/5">
            Current
          </span>
        )}
      </div>
      <div className="text-[28px] font-bold text-dl-forest">{price}</div>
      <p className="mt-2 text-[12px] text-dl-muted">{tagline}</p>
      <ul className="mt-5 flex flex-1 flex-col gap-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[12px] text-dl-muted">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-dl-teal" />
            {f}
          </li>
        ))}
      </ul>
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  )
}
