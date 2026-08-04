import Link from 'next/link'
import { LandingFooter } from '@/components/landing/v2/LandingFooter'
import { PublicNav } from '@/components/layout/PublicNav'

const QUICKSTART_STEPS = [
  'Install Beacon in Cursor, VS Code, or JetBrains.',
  'Open any repository and start coding normally.',
  'Beacon reviews each AI-generated change before commit.',
  'Fix flagged issues and ship with confidence.',
]

const RULE_EXAMPLES = [
  { name: 'Block hardcoded secrets', value: 'critical' },
  { name: 'Warn on unsafe shell execution', value: 'high' },
  { name: 'Flag weak crypto usage', value: 'high' },
]

export const metadata = {
  title: 'Docs — Beacon',
}

export default function DocsPage() {
  return (
    <div className="beacon-landing">
      <div className="bl-shell">
        <PublicNav />

        <main className="py-14 sm:py-[90px]">
          <section className="mb-14 sm:mb-20">
            <div className="mb-7 inline-block rounded bg-[#08090a] px-[14px] py-[6px] text-[12.5px] font-bold uppercase tracking-[.04em] text-[#f2f0ed]">
              Docs
            </div>
            <h1 className="mb-6 max-w-[16ch] text-[clamp(40px,11vw,96px)] font-bold leading-[.95] tracking-[-.05em]">
              Build faster.
              <br />
              Ship safer.
            </h1>
            <p className="max-w-[52ch] text-[17px] leading-[1.6] text-[rgba(8,9,10,.55)] md:text-[20px]">
              Beacon runs in your editor, reviews generated code locally, and blocks risky changes
              before they land in your branch.
            </p>
          </section>

          <section className="mb-16 grid gap-6 sm:mb-24 sm:gap-8 lg:grid-cols-2">
            <div className="rounded-xl border border-black/[0.09] bg-[#ffffff] p-6 sm:p-8">
              <h2 className="mb-5 text-[24px] font-semibold tracking-[-0.02em] sm:text-[28px]">Quickstart</h2>
              <ol className="space-y-4">
                {QUICKSTART_STEPS.map((step, idx) => (
                  <li key={step} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#08090a] text-[12px] font-bold text-[#f2f0ed]">
                      {idx + 1}
                    </span>
                    <span className="text-[16px] leading-[1.6] text-[rgba(8,9,10,.82)]">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl border border-black/[0.09] bg-[#ffffff] p-8">
              <h2 className="mb-5 text-[28px] font-semibold tracking-[-0.02em]">Install</h2>
              <div className="space-y-3">
                <Link
                  href="/register"
                  className="block rounded-lg border border-black/[0.1] bg-black/[0.015] px-4 py-3 text-[15px] text-[rgba(8,9,10,.9)] hover:border-black/30"
                >
                  Cursor Extension
                </Link>
                <Link
                  href="/register"
                  className="block rounded-lg border border-black/[0.1] bg-black/[0.015] px-4 py-3 text-[15px] text-[rgba(8,9,10,.9)] hover:border-black/30"
                >
                  VS Code Extension
                </Link>
                <Link
                  href="/register"
                  className="block rounded-lg border border-black/[0.1] bg-black/[0.015] px-4 py-3 text-[15px] text-[rgba(8,9,10,.9)] hover:border-black/30"
                >
                  JetBrains Plugin
                </Link>
                <Link
                  href="/register"
                  className="block rounded-lg border border-black/[0.1] bg-black/[0.015] px-4 py-3 text-[15px] text-[rgba(8,9,10,.9)] hover:border-black/30"
                >
                  MCP Server + CLI
                </Link>
              </div>
            </div>
          </section>

          <section className="mb-24">
            <h2 className="mb-8 text-[40px] font-bold tracking-[-0.03em] md:text-[52px]">Rule policy example</h2>
            <div className="overflow-hidden rounded-xl border border-black/[0.09] bg-[#ffffff]">
              <div className="border-b border-black/[0.09] px-5 py-3 text-[12px] text-[rgba(8,9,10,.55)]">
                beacon.rules.json
              </div>
              <pre className="bl-mono overflow-x-auto bg-[#f7f6f4] p-5 text-[13px] leading-[1.7] text-[rgba(8,9,10,.88)]">
{`{
  "mode": "enforce",
  "rules": [
${RULE_EXAMPLES.map((item) => `    { "name": "${item.name}", "severity": "${item.value}" }`).join(',\n')}
  ]
}`}
              </pre>
            </div>
          </section>

          <section className="mb-16 rounded-xl border border-black/[0.09] bg-[#ffffff] p-8">
            <h2 className="mb-5 text-[30px] font-semibold tracking-[-0.02em]">Need help?</h2>
            <p className="mb-6 max-w-[62ch] text-[16px] leading-[1.6] text-[rgba(8,9,10,.65)]">
              For enterprise onboarding, custom policies, or migration support, contact the Beacon
              team and we’ll help you set up your workflow quickly.
            </p>
            <a
              href="mailto:hello@beaconapp.dev?subject=Beacon%20Docs%20Support"
              className="bl-on-orange inline-flex items-center rounded-full bg-[#08090a] px-5 py-2.5 text-[14px] font-semibold text-[#f2f0ed] hover:opacity-90"
            >
              Contact support
            </a>
          </section>
        </main>
      </div>
      <LandingFooter />
    </div>
  )
}
