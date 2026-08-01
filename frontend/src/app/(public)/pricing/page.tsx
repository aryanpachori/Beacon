import Link from 'next/link'
import { LandingFooter } from '@/components/landing/v2/LandingFooter'
import { PublicNav } from '@/components/layout/PublicNav'

const CORE_FEATURES = [
  'Offline review, on-device',
  'All 7 languages',
  'Cursor, VS Code, JetBrains',
  'MCP server + REST API',
  'Custom severity rules',
]

const ENTERPRISE_FEATURES = [
  'Everything in Core, plus',
  'Self-hosted deployment',
  'Audit logs & role-based access',
  'SOC 2 Type II, 99.9% SLA',
  'Dedicated CSM, private Slack',
]

const COMPARISON_ROWS = [
  ['Pricing model', '$29/mo per seat', 'Custom volume & terms'],
  ['Review model', 'Local, offline analysis', 'Local + shared team policies'],
  ['Seats', 'No per-seat cap', 'Unlimited'],
  ['Deployment', 'IDE, MCP, REST API', 'Self-hosted, on-prem'],
  ['Audit logs & RBAC', 'Not included', 'Included'],
  ['SOC 2 Type II', '–', 'Included'],
  ['Support', 'Priority email', 'Dedicated CSM, private Slack'],
] as const

const FAQS = [
  {
    q: 'Can I switch plans anytime?',
    a: 'Yes — upgrade or downgrade at any time, prorated to the day.',
  },
  {
    q: 'Is there a discount for annual billing?',
    a: 'Yes — annual billing saves 20% versus monthly.',
  },
  {
    q: 'Do you offer startup discounts?',
    a: 'Yes — reach out to sales, we support early-stage teams.',
  },
  {
    q: 'How does the seat model work?',
    a: 'One seat per developer using Beacon in their IDE. No metering on reviews or files scanned.',
  },
]

function Check({ alt = false }: { alt?: boolean }) {
  return (
    <span
      className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
        alt ? 'bg-[#f2f0ed] text-[#0b0a08]' : 'bg-[#ff6600] text-[#0b0a08]'
      }`}
    >
      ✓
    </span>
  )
}

export default function PricingPage() {
  return (
    <>
      <div className="bl-shell">
        <PublicNav />

        <main className="py-[90px]">
          <section className="mb-20">
            <div className="mb-7 inline-block rounded bg-[#ff6600] px-[14px] py-[6px] text-[12.5px] font-bold uppercase tracking-[.04em] text-[#0b0a08]">
              Pricing
            </div>
            <h1 className="mb-6 max-w-[14ch] text-[56px] font-bold leading-[.95] tracking-[-.05em] md:text-[80px] lg:text-[104px]">
              Pay per seat.
              <br />
              Ship without limits.
            </h1>
            <p className="max-w-[44ch] text-[18px] leading-[1.5] text-[rgba(242,240,237,.55)] md:text-[20px]">
              No metered reviews. No usage caps. Cancel anytime.
            </p>
          </section>

          <section className="mb-6 grid border-2 border-[#f2f0ed] lg:grid-cols-2 lg:items-stretch">
            <div className="flex flex-col border-b-2 border-[#f2f0ed] p-8 md:p-12 lg:border-b-0 lg:border-r-2">
              <p className="mb-8 min-h-[18px] text-[13px] font-bold uppercase tracking-[.06em] text-[rgba(242,240,237,.5)]">
                01 · Core
              </p>
              <div className="mb-2 flex min-h-[88px] items-end md:min-h-[104px]">
                <span className="text-[72px] font-bold leading-none tracking-[-.04em] md:text-[104px]">$29</span>
              </div>
              <p className="mb-10 min-h-[23px] text-[15px] font-semibold leading-none text-[rgba(242,240,237,.4)]">
                per seat / month
              </p>
              <Link
                href="/register"
                className="mb-12 flex h-[62px] items-center justify-center bg-[#ff6600] px-6 text-center text-[17px] font-bold leading-none text-[#0b0a08] hover:bg-[#ff8533]"
              >
                Start with Core →
              </Link>
              <div className="flex flex-col gap-5">
                {CORE_FEATURES.map((item) => (
                  <div key={item} className="flex items-center gap-[14px] text-[16px] font-semibold leading-[1.3]">
                    <Check />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex flex-col bg-[#ff6600] p-8 md:p-12">
              <div className="absolute right-8 top-8 bg-[#0b0a08] px-[14px] py-[6px] text-[12px] font-bold uppercase tracking-[.04em] text-[#ff6600] md:right-12 md:top-7">
                Most requested
              </div>
              <p className="mb-8 min-h-[18px] text-[13px] font-bold uppercase tracking-[.06em] text-[rgba(11,10,8,.6)]">
                02 · Enterprise
              </p>
              <div className="mb-2 flex min-h-[88px] items-end md:min-h-[104px]">
                <span className="text-[72px] font-bold leading-none tracking-[-.04em] text-[#0b0a08] md:text-[104px]">
                  Custom
                </span>
              </div>
              <p className="mb-10 min-h-[23px] text-[15px] font-semibold leading-none text-[rgba(11,10,8,.55)]">
                volume-based terms
              </p>
              <a
                href="mailto:hello@beaconapp.dev?subject=Beacon%20Enterprise%20Demo"
                className="bl-on-black mb-12 flex h-[62px] items-center justify-center bg-[#0b0a08] px-6 text-center text-[17px] font-bold leading-none text-[#ff6600] hover:opacity-90"
              >
                Request a demo →
              </a>
              <div className="flex flex-col gap-5">
                {ENTERPRISE_FEATURES.map((item) => (
                  <div key={item} className="flex items-center gap-[14px] text-[16px] font-semibold leading-[1.3] text-[#0b0a08]">
                    <Check alt />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <p className="mb-40 text-center text-[12.5px] tracking-[.02em] text-[rgba(242,240,237,.4)]">
            New accounts start with a 14-day Core trial — no card required
          </p>

          <section className="mb-40">
            <h2 className="mb-14 border-b-2 border-white/[0.09] pb-8 text-[40px] font-bold tracking-[-.03em] md:text-[56px]">
              Core vs. Enterprise
            </h2>
            <div className="flex flex-col">
              {COMPARISON_ROWS.map(([label, core, enterprise], idx) => (
                <div
                  key={label}
                  className={`grid gap-6 py-7 md:grid-cols-[1.4fr_1fr_1fr] ${
                    idx < COMPARISON_ROWS.length - 1 ? 'border-b border-white/[0.09]' : ''
                  }`}
                >
                  <div className="text-[16px] font-bold text-[rgba(242,240,237,.9)]">{label}</div>
                  <div
                    className={`text-[16px] ${
                      core === 'Not included' || core === '–'
                        ? 'text-[rgba(242,240,237,.3)]'
                        : 'text-[rgba(242,240,237,.65)]'
                    }`}
                  >
                    {core}
                  </div>
                  <div className="text-[16px] font-bold text-[#ff6600]">{enterprise}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-36 max-w-[820px]">
            <h2 className="mb-14 border-b-2 border-white/[0.09] pb-8 text-[40px] font-bold tracking-[-.03em] md:text-[56px]">
              Common questions
            </h2>
            <div className="flex flex-col">
              {FAQS.map((faq, idx) => (
                <div
                  key={faq.q}
                  className={`py-7 ${idx < FAQS.length - 1 ? 'border-b border-white/[0.09]' : ''}`}
                >
                  <h3 className="mb-2.5 text-[19px] font-bold">{faq.q}</h3>
                  <p className="text-[15px] leading-[1.6] text-[rgba(242,240,237,.55)]">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>
      <LandingFooter />
    </>
  )
}
