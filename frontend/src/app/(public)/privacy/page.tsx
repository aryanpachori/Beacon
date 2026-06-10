import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — DriftLogg',
}

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="section-light">
        <div className="mx-auto max-w-2xl px-6 py-24">
          <h1 className="marketing-title text-[28px] md:text-[32px]">Privacy Policy</h1>
          <p className="mt-2 text-sm text-dl-muted">Last updated: March 17, 2026</p>
          <div className="mt-10 space-y-6 text-sm leading-relaxed text-dl-forest">
            <section>
              <h2 className="mb-2 text-lg font-semibold text-dl-forest">Overview</h2>
              <p>
                DriftLogg (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy describes what we
                collect when you use our website and product, and how we use that information.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-dl-forest">Data we collect</h2>
              <p>
                Account information (such as email), GitHub connection metadata needed to analyze
                repositories you authorize, and usage data to improve the service. We do not sell your
                personal data.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-dl-forest">Contact</h2>
              <p>
                Questions about privacy? Email{' '}
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
