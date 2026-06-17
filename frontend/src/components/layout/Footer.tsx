'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Mail } from 'lucide-react'



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
      { label: 'Contact', href: 'mailto:hello@beacon.com' },
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
      <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.08em] text-white/45">
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-[13px] text-white/65 transition-colors hover:text-white"
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
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center gap-2.5 mb-2">
        <Mail className="h-4 w-4 text-dl-teal" />
        <p className="text-[15px] font-medium text-white">Weekly Dependency Digest</p>
      </div>
      <p className="text-[13px] text-white/60 mb-4">
        Get a weekly summary of trending package risks. No spam, unsubscribe anytime.
      </p>
      {submitted ? (
        <p className="text-sm text-dl-teal font-medium">✓ You&apos;re subscribed! Check your inbox.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="flex-1 rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-dl-teal/50"
          />
          <button
            type="submit"
            className="w-full sm:w-auto rounded-lg bg-dl-teal px-5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  )
}

export function Footer() {
  return (
    <footer className="bg-dl-nav">
      <div className="mx-auto max-w-[1200px] px-6 pb-6 pt-10">
        {/* Newsletter Signup Row */}
        <div className="mb-8">
          <NewsletterSignup />
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/image.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 rounded-md"
              />
              <span className="text-[17px] font-semibold text-white">Beacon</span>
            </Link>
            <p className="mt-3 max-w-[200px] text-[13px] leading-relaxed text-white/65">
              Predict dependency rot before it hits production.
            </p>

          </div>

          {FOOTER_COLUMNS.map((col) => (
            <FooterColumn key={col.title} title={col.title} links={col.links} />
          ))}
        </div>

        <div className="mt-8 border-t border-white/10 pt-4 space-y-2">
          {/* Row 1: copyright | Built by | tagline — all inline */}
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/45 shrink-0">© 2026 Beacon. All rights reserved.</p>
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-white/35">Built by</span>
            <p className="text-xs italic text-white/40 shrink-0">Built for engineers who ship.</p>
          </div>

          {/* Row 2: founder names centred below */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {[
              { name: 'Aryan Pachori',   github: 'https://github.com/aryanpachori',   x: 'https://x.com/aryan42116' },
              { name: 'Samarth Kapoor',  github: 'https://github.com/samarthkapoor7', x: 'https://x.com/samarthtwt' },
              { name: 'Aryan Madolkar',  github: 'https://github.com/AryanMadolkar',  x: 'https://x.com/aryanmadolkar10' },
            ].map(({ name, github, x }) => (
              <div key={name} className="flex items-center gap-1.5">
                <span className="text-[12px] font-medium text-white/65">{name}</span>
                <a
                  href={x}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${name} on X`}
                  className="text-white/40 transition-colors hover:text-white"
                >
                  <svg className="h-[13px] w-[13px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${name} on GitHub`}
                  className="text-white/40 transition-colors hover:text-white"
                >
                  <svg className="h-[13px] w-[13px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
