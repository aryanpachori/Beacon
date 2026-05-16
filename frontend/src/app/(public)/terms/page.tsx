import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — DriftLogg',
}

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="section-light">
        <div className="mx-auto max-w-2xl px-6 py-24">
          <h1 className="text-3xl font-bold tracking-tight text-dl-forest">Terms of Service</h1>
          <p className="mt-2 text-sm text-dl-muted">Last updated: March 17, 2026</p>
          <div className="mt-10 space-y-6 text-sm leading-relaxed text-dl-forest/90">
            <section>
              <h2 className="mb-2 text-lg font-semibold text-dl-forest">Agreement</h2>
              <p>
                By using DriftLogg, you agree to these terms. If you do not agree, do not use the
                service.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-dl-forest">Service</h2>
              <p>
                DriftLogg provides repository analysis and drift detection. Features and availability
                may change as we improve the product. We strive for accuracy but do not guarantee
                uninterrupted or error-free operation.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-dl-forest">Contact</h2>
              <p>
                Questions? Email{' '}
                <a href="mailto:hello@driftlogg.com" className="text-dl-teal underline-offset-2 hover:underline">
                  hello@driftlogg.com
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
