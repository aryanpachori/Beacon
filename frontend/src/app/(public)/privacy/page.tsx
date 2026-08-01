import Link from 'next/link'
import { LandingFooter } from '@/components/landing/v2/LandingFooter'
import { PublicNav } from '@/components/layout/PublicNav'

export const metadata = {
  title: 'Privacy Policy — Beacon',
}

export default function PrivacyPage() {
  return (
    <div className="beacon-landing">
      <div className="bl-shell">
        <PublicNav />
        <main className="py-24">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">Privacy Policy</h1>
            <p className="mt-2 text-sm text-[rgba(8,9,10,.55)]">Last updated: June 20, 2026</p>
            <div className="mt-10 space-y-6 text-sm leading-relaxed text-[rgba(8,9,10,.82)]">
              <section>
                <h2 className="mb-2 text-lg font-semibold text-[#08090a]">Overview</h2>
                <p>
                  Beacon (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy describes what we
                  collect when you use our website and product, and how we use that information.
                </p>
              </section>
              <section>
                <h2 className="mb-2 text-lg font-semibold text-[#08090a]">Data we collect</h2>
                <p>
                  Account information (such as email), GitHub connection metadata needed to analyze
                  repositories you authorize, and usage data to improve the service. We do not sell your
                  personal data.
                </p>
              </section>
              <section>
                <h2 className="mb-2 text-lg font-semibold text-[#08090a]">Contact</h2>
                <p>
                  Questions about privacy? Email{' '}
                  <a
                    href="mailto:founders@beacon.forgefastlabs.com"
                    className="text-[#08090a] underline-offset-2 hover:underline"
                  >
                    founders@beacon.forgefastlabs.com
                  </a>
                  .
                </p>
              </section>
              <p className="pt-4">
                <Link href="/" className="text-sm font-medium text-[#08090a] hover:underline">
                  ← Back to home
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
      <LandingFooter />
    </div>
  )
}
