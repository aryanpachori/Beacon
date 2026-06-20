import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — Beacon',
}

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="section-light">
        <div className="mx-auto max-w-2xl px-6 py-24">
          <h1 className="marketing-title text-[28px] md:text-[32px]">Terms of Service</h1>
          <p className="mt-2 text-sm text-dl-muted">Last updated: June 20, 2026</p>
          <div className="mt-10 space-y-6 text-sm leading-relaxed text-dl-forest">
            <section>
              <h2 className="mb-2 text-lg font-semibold text-dl-forest">Agreement</h2>
              <p>
                By using Beacon, you agree to these terms. If you do not agree, do not use the
                service.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-dl-forest">Service</h2>
              <p>
                Beacon provides repository analysis and drift detection. Features and availability
                may change as we improve the product. We strive for accuracy but do not guarantee
                uninterrupted or error-free operation.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-dl-forest">Contact</h2>
              <p>
                Questions? Email{' '}
                <a href="mailto:hello@beaconapp.dev" className="text-dl-teal underline-offset-2 hover:underline">
                  hello@beaconapp.dev
                </a>
                .
              </p>
            </section>
            <p className="pt-4">
              <Link href="/" className="text-sm font-medium text-dl-teal hover:underline">
                ← Back to home
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
