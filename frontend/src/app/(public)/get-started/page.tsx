import Link from 'next/link'
import { LandingFooter } from '@/components/landing/v2/LandingFooter'
import { PublicNav } from '@/components/layout/PublicNav'
import { LocalInstallGuide } from '@/components/marketing/LocalInstallGuide'

export const metadata = {
  title: 'Get started — Beacon',
  description: 'Install Beacon locally with zero mandatory account. MCP, CLI, and IDE scanners run on your machine.',
}

export default function GetStartedPage() {
  return (
    <div className="beacon-landing">
      <div className="bl-shell">
        <PublicNav />

        <main className="py-14 sm:py-[90px]">
          <section className="mb-10 sm:mb-14">
            <div className="mb-7 inline-block rounded bg-[#08090a] px-[14px] py-[6px] text-[12.5px] font-bold uppercase tracking-[.04em] text-[#f2f0ed]">
              Local-first
            </div>
            <h1 className="mb-5 max-w-[14ch] text-[clamp(36px,9vw,72px)] font-bold leading-[.98] tracking-[-.05em]">
              Install Beacon.
              <br />
              No account required.
            </h1>
            <p className="max-w-[52ch] text-[17px] leading-[1.6] text-[rgba(8,9,10,.55)] md:text-[19px]">
              Scans run on your machine via MCP, CLI, or the IDE extension. Cloud sync and GitHub
              dependency tracking are optional add-ons.
            </p>
            <p className="mt-4 text-[14px] text-[rgba(8,9,10,.45)]">
              Prefer the dashboard later?{' '}
              <Link href="/register" className="underline underline-offset-2 hover:text-[#08090a]">
                Create an account
              </Link>
              .
            </p>
          </section>

          <LocalInstallGuide />
        </main>

        <LandingFooter />
      </div>
    </div>
  )
}
