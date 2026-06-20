'use client'

import { Check, CreditCard, Rocket } from 'lucide-react'

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
  return (
    <div className="app-page">
      <div className="mb-8">
        <h1 className="page-heading text-dl-forest">Billing</h1>
        <p className="mt-1 text-[13px] text-dl-muted">
          Manage your Beacon plan and subscription.
        </p>
      </div>

      {/* Coming Soon Banner */}
      <div
        className="mb-6 flex items-start gap-3 rounded-xl px-5 py-4"
        style={{ background: 'rgba(99,102,241,0.08)', border: '1.5px solid rgba(99,102,241,0.3)' }}
      >
        <Rocket className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
        <div>
          <p className="text-[14px] font-semibold text-dl-navy">Pro plan is coming soon</p>
          <p className="mt-0.5 text-[12px] text-dl-muted">
            We&apos;re finalising billing infrastructure. You&apos;re on the Starter (free) plan for now — full Pro features are on their way.
          </p>
        </div>
      </div>

      {/* Current plan */}
      <div
        className="mb-6 rounded-xl px-6 py-5"
        style={{ background: 'rgba(47,126,218,0.08)', border: '1.5px solid rgba(47,126,218,0.35)' }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-dl-muted">Current plan</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold capitalize text-dl-teal">Starter</span>
          <span className="text-[13px] text-dl-muted">Free</span>
        </div>
        <p className="mt-2 text-[13px] text-dl-muted">
          1 repo · up to 200 packages · weekly digest
        </p>
      </div>

      {/* Plan comparison */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Starter */}
        <div className="flex flex-col rounded-xl border border-dl-border bg-dl-bg p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[15px] font-semibold text-dl-forest">Starter</span>
            <span className="rounded-md border border-dl-border bg-dl-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-dl-muted">
              Current
            </span>
          </div>
          <div className="text-[28px] font-bold text-dl-forest">₹0</div>
          <p className="mt-2 text-[12px] text-dl-muted">Forever free for individual developers.</p>
          <ul className="mt-5 flex flex-1 flex-col gap-2">
            {STARTER_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2 text-[12px] text-dl-muted">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-dl-teal" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro — Coming Soon */}
        <div className="relative flex flex-col rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-6 overflow-hidden">
          {/* Coming Soon ribbon */}
          <div className="absolute right-[-28px] top-5 rotate-45 bg-indigo-500 px-10 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
            Coming Soon
          </div>

          <div className="mb-4 flex items-center justify-between">
            <span className="text-[15px] font-semibold text-dl-forest">Pro</span>
          </div>
          <div className="text-[28px] font-bold text-dl-forest opacity-50">₹999<span className="text-[16px] font-normal">/mo</span></div>
          <p className="mt-2 text-[12px] text-dl-muted">For engineers and small teams who need proactive alerts.</p>
          <ul className="mt-5 flex flex-1 flex-col gap-2">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2 text-[12px] text-dl-muted">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-indigo-400" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <button
              type="button"
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-indigo-500/30 py-2.5 text-[13px] font-semibold text-indigo-300"
            >
              <Rocket className="h-4 w-4" />
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="mt-6 rounded-xl border border-dl-border bg-dl-bg px-6 py-5">
        <div className="flex items-start gap-3">
          <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-dl-teal" />
          <div>
            <p className="text-[15px] font-semibold text-dl-forest">Payments via Razorpay</p>
            <p className="mt-1 text-[13px] leading-relaxed text-dl-muted">
              Billing will be handled securely through Razorpay when Pro launches. You&apos;ll receive an email as soon as it&apos;s available.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
