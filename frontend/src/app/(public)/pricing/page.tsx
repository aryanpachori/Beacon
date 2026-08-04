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
        alt ? 'bg-[#f2f0ed] text-[#08090a]' : 'bg-[#08090a] text-[#f2f0ed]'
      }`}
    >
      ✓
    </span>
  )
}

export default function PricingPage() {
  return (
    <div className="beacon-landing">
      <div className="bl-shell">
        <PublicNav />

        <main className="py-14 sm:py-[90px]">
          <section className="mb-14 sm:mb-20">
            <div className="mb-7 inline-block rounded bg-[#08090a] px-[14px] py-[6px] text-[12.5px] font-bold uppercase tracking-[.04em] text-[#f2f0ed]">
              Pricing
            </div>
            <h1 className="mb-6 max-w-[14ch] text-[clamp(40px,11vw,104px)] font-bold leading-[.95] tracking-[-.05em]">
              Pay per seat.
              <br />
              Ship without limits.
            </h1>
            <p className="max-w-[44ch] text-[17px] leading-[1.5] text-[rgba(8,9,10,.55)] md:text-[20px]">
              No metered reviews. No usage caps. Cancel anytime.
            </p>
          </section>

          <section className="mb-6 grid border-2 border-[#08090a] lg:grid-cols-2 lg:items-stretch">
            <div className="flex flex-col border-b-2 border-[#08090a] p-6 sm:p-8 md:p-12 lg:border-b-0 lg:border-r-2">
              <div className="mb-8 flex h-[30px] items-center">
                <p className="text-[13px] font-bold uppercase tracking-[.06em] text-[rgba(8,9,10,.5)]">
                  01 · Core
                </p>
              </div>
              <div className="mb-2 flex min-h-[56px] items-end sm:min-h-[72px] md:min-h-[104px]">
                <span className="text-[clamp(48px,14vw,104px)] font-bold leading-none tracking-[-.04em]">
                  $29
                </span>
              </div>
              <p className="bl-mono mb-10 h-[15px] text-[15px] font-semibold leading-none text-[rgba(8,9,10,.4)]">
                per seat / month
              </p>
              <Link
                href="/register"
                className="mb-12 box-border flex h-[52px] shrink-0 items-center justify-center bg-[#08090a] px-6 text-center text-[17px] font-bold leading-none text-[#f2f0ed] hover:opacity-90"
              >
                Start with Core →
              </Link>
              <div className="flex flex-col gap-5">
                {CORE_FEATURES.map((item) => (
                  <div key={item} className="flex items-center gap-[14px] text-[15px] font-semibold leading-[1.3] sm:text-[16px]">
                    <Check />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex flex-col bg-[#08090a] p-6 sm:p-8 md:p-12">
              <div className="mb-8 flex h-auto min-h-[30px] flex-wrap items-center justify-between gap-3">
                <p className="text-[13px] font-bold uppercase tracking-[.06em] text-[rgba(242,240,237,.6)]">
                  02 · Enterprise
                </p>
                <span className="shrink-0 bg-[#f2f0ed] px-[14px] py-[6px] text-[12px] font-bold uppercase tracking-[.04em] text-[#08090a]">
                  Most requested
                </span>
              </div>
              <div className="mb-2 flex min-h-[56px] items-end sm:min-h-[72px] md:min-h-[104px]">
                <span className="text-[clamp(40px,12vw,104px)] font-bold leading-none tracking-[-.04em] text-[#f2f0ed]">
                  Custom
                </span>
              </div>
              <p className="bl-mono mb-10 h-[15px] text-[15px] font-semibold leading-none text-[rgba(242,240,237,.55)]">
                volume-based terms
              </p>
              <a
                href="mailto:hello@beaconapp.dev?subject=Beacon%20Enterprise%20Demo"
                className="pricing-btn-light mb-12 box-border flex h-[52px] shrink-0 items-center justify-center bg-[#f2f0ed] px-6 text-center text-[17px] font-bold leading-none hover:opacity-90"
              >
                Request a demo →
              </a>
              <div className="flex flex-col gap-5">
                {ENTERPRISE_FEATURES.map((item) => (
                  <div key={item} className="flex items-center gap-[14px] text-[15px] font-semibold leading-[1.3] text-[#f2f0ed] sm:text-[16px]">
                    <Check alt />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <p className="mb-20 text-center text-[12.5px] tracking-[.02em] text-[rgba(8,9,10,.4)] sm:mb-40">
            New accounts start with a 14-day Core trial — no card required
          </p>

          <section className="mb-20 sm:mb-40">
            <h2 className="mb-8 border-b-2 border-black/[0.09] pb-6 text-[clamp(28px,7vw,56px)] font-bold tracking-[-.03em] sm:mb-14 sm:pb-8">
              Core vs. Enterprise
            </h2>
            <div className="flex flex-col">
              {COMPARISON_ROWS.map(([label, core, enterprise], idx) => (
                <div
                  key={label}
                  className={`grid gap-3 py-6 sm:gap-6 sm:py-7 md:grid-cols-[1.4fr_1fr_1fr] ${
                    idx < COMPARISON_ROWS.length - 1 ? 'border-b border-black/[0.09]' : ''
                  }`}
                >
                  <div className="text-[15px] font-bold text-[rgba(8,9,10,.9)] sm:text-[16px]">{label}</div>
                  <div
                    className={`text-[14px] sm:text-[16px] ${
                      core === 'Not included' || core === '–'
                        ? 'text-[rgba(8,9,10,.3)]'
                        : 'text-[rgba(8,9,10,.65)]'
                    }`}
                  >
                    <span className="mr-2 font-semibold text-[rgba(8,9,10,.4)] md:hidden">Core · </span>
                    {core}
                  </div>
                  <div className="text-[14px] font-bold text-[#08090a] sm:text-[16px]">
                    <span className="mr-2 font-semibold text-[rgba(8,9,10,.4)] md:hidden">Enterprise · </span>
                    {enterprise}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-20 max-w-[820px] sm:mb-36">
            <h2 className="mb-8 border-b-2 border-black/[0.09] pb-6 text-[clamp(28px,7vw,56px)] font-bold tracking-[-.03em] sm:mb-14 sm:pb-8">
              Common questions
            </h2>
            <div className="flex flex-col">
              {FAQS.map((faq, idx) => (
                <div
                  key={faq.q}
                  className={`py-6 sm:py-7 ${idx < FAQS.length - 1 ? 'border-b border-black/[0.09]' : ''}`}
                >
                  <h3 className="mb-2.5 text-[17px] font-bold sm:text-[19px]">{faq.q}</h3>
                  <p className="text-[14px] leading-[1.6] text-[rgba(8,9,10,.55)] sm:text-[15px]">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="pricing-cta-panel bg-[#08090a] px-5 py-14 text-center text-[#f2f0ed] sm:px-8 sm:py-20 md:px-16">
            <h2 className="mb-6 text-[clamp(32px,9vw,68px)] font-bold leading-none tracking-[-.04em] text-[#f2f0ed]">
              Ready to ship securely?
            </h2>
            <p className="mb-10 text-[16px] font-semibold text-[rgba(242,240,237,.72)] sm:text-[18px]">
              Start with Core, or talk to us about Enterprise.
            </p>
            <div className="mb-11 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/register"
                className="pricing-btn-light px-8 py-[18px] text-[16px] font-bold"
                style={{ background: '#f2f0ed' }}
              >
                Start with Core
              </Link>
              <a
                href="mailto:hello@beaconapp.dev?subject=Beacon%20Enterprise%20Demo"
                className="pricing-btn-ghost border-2 border-[#f2f0ed] px-8 py-[18px] text-[16px] font-bold"
              >
                Contact sales
              </a>
            </div>
            <div className="bl-mono flex flex-wrap justify-center gap-[26px] text-[12.5px] font-semibold tracking-[.02em] text-[rgba(242,240,237,.65)]">
              <span>End-to-end encryption</span>
              <span>·</span>
              <span>Zero data retention</span>
              <span>·</span>
              <span>SOC 2 Type II</span>
            </div>
          </section>
        </main>
      </div>
      <LandingFooter />
    </div>
  )
}
