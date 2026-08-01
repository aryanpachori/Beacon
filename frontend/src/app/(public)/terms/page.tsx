import Link from 'next/link'
import { LandingFooter } from '@/components/landing/v2/LandingFooter'
import { PublicNav } from '@/components/layout/PublicNav'

export const metadata = {
  title: 'Terms of Service — Beacon',
}

export default function TermsPage() {
  return (
    <>
      <div className="bl-shell">
        <PublicNav />
        <main className="py-24">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">Terms of Service</h1>
            <p className="mt-2 text-sm text-[rgba(242,240,237,.55)]">Last updated: June 20, 2026</p>
            <div className="mt-10 space-y-6 text-sm leading-relaxed text-[rgba(242,240,237,.82)]">
              <section>
                <h2 className="mb-2 text-lg font-semibold text-[#f2f0ed]">Agreement</h2>
                <p>
                  By using Beacon, you agree to these terms. If you do not agree, do not use the
                  service.
                </p>
              </section>
              <section>
                <h2 className="mb-2 text-lg font-semibold text-[#f2f0ed]">Service</h2>
                <p>
                  Beacon provides repository analysis and drift detection. Features and availability
                  may change as we improve the product. We strive for accuracy but do not guarantee
                  uninterrupted or error-free operation.
                </p>
              </section>
              <section>
                <h2 className="mb-2 text-lg font-semibold text-[#f2f0ed]">Contact</h2>
                <p>
                  Questions? Email{' '}
                  <a
                    href="mailto:founders@beacon.forgefastlabs.com"
                    className="text-[#ff6600] underline-offset-2 hover:underline"
                  >
                    founders@beacon.forgefastlabs.com
                  </a>
                  .
                </p>
              </section>
              <p className="pt-4">
                <Link href="/" className="text-sm font-medium text-[#ff6600] hover:underline">
                  ← Back to home
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
      <LandingFooter />
    </>
  )
}
