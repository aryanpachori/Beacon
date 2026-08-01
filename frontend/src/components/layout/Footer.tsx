'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Packages', href: '/packages' },
      { label: 'Alerts', href: '/alerts' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/#features' },
      { label: 'Contact', href: 'mailto:founders@beacon.forgefastlabs.com' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
]

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.1em] text-dl-muted">
        {title}
      </p>
      <ul className="space-y-3">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-[13.5px] text-dl-forest transition-colors hover:text-dl-text"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubmitted(true)
      setEmail('')
    }
  }

  return (
    <div>
      <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.1em] text-dl-muted">
        Stay in the loop
      </p>
      {submitted ? (
        <div className="flex items-center gap-2 text-dl-teal text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          You&apos;re in — check your inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="flex-1 rounded-[9px] border border-dl-border bg-dl-surface px-3.5 py-2.5 text-[13px] text-dl-text placeholder:text-dl-muted outline-none focus:border-dl-teal/50 transition-colors"
          />
          <button
            type="submit"
            className="btn-primary shrink-0 px-4 py-2.5 text-[13px]"
          >
            Subscribe
          </button>
        </form>
      )}
      <p className="mt-2.5 text-[11px] text-dl-muted">Product updates, occasionally. No spam.</p>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="section-dark">
      <div className="hairline" />
      <div className="mx-auto max-w-[1180px] px-6 pb-8 pt-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 rounded-md"
              />
              <span className="text-[17px] font-semibold text-dl-text">beacon</span>
            </Link>
            <p className="mt-4 max-w-[220px] text-[13.5px] leading-relaxed text-dl-muted">
              The AI Security Engineer that watches your code as it&apos;s written.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <FooterColumn key={col.title} title={col.title} links={col.links} />
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-14 border-t border-dl-border pt-9 max-w-sm">
          <NewsletterSignup />
        </div>

        <div className="mt-9 border-t border-dl-border pt-5">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <p className="text-xs text-dl-muted">© 2026 Beacon. All rights reserved.</p>
              <a
                href="https://www.producthunt.com/products/beacon-23?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-beacon-28"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  alt="Beacon - Know before your dependencies break. | Product Hunt"
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1176923&theme=dark&t=1781985098931"
                  width={167}
                  height={36}
                  style={{ width: '167px', height: '36px' }}
                />
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {[
                { name: 'Aryan Pachori',   github: 'https://github.com/aryanpachori',   x: 'https://x.com/aryan42116' },
                { name: 'Samarth Kapoor',  github: 'https://github.com/samarthkapoor7', x: 'https://x.com/samarthtwt' },
                { name: 'Aryan Madolkar',  github: 'https://github.com/AryanMadolkar',  x: 'https://x.com/aryanmadolkar10' },
              ].map(({ name, github, x }) => (
                <div key={name} className="flex items-center gap-1.5">
                  <span className="text-[12px] font-medium text-dl-forest">{name}</span>
                  <a href={x} target="_blank" rel="noopener noreferrer" aria-label={`${name} on X`} className="text-dl-muted transition-colors hover:text-dl-text">
                    <svg className="h-[13px] w-[13px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                  <a href={github} target="_blank" rel="noopener noreferrer" aria-label={`${name} on GitHub`} className="text-dl-muted transition-colors hover:text-dl-text">
                    <svg className="h-[13px] w-[13px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" /></svg>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
