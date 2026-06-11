'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Mail } from 'lucide-react'

const FOUNDER = {
  name: 'Aryan Pachori',
  x: 'https://x.com/aryan42116',
  github: 'https://github.com/aryanpachori',
} as const

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FounderSocialLinks({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`}>
      <a
        href={FOUNDER.x}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${FOUNDER.name} on X`}
        className="text-dl-sage-light/50 transition-colors hover:text-dl-sage-light"
      >
        <XIcon className="h-[18px] w-[18px]" />
      </a>
      <a
        href={FOUNDER.github}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${FOUNDER.name} on GitHub`}
        className="text-dl-sage-light/50 transition-colors hover:text-dl-sage-light"
      >
        <GitHubIcon className="h-[18px] w-[18px]" />
      </a>
    </div>
  )
}

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
      { label: 'Contact', href: 'mailto:hello@driftlogg.com' },
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
      <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.08em] text-dl-hint">
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-[13px] text-dl-sage-light/55 transition-colors hover:text-dl-cream"
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
    <div className="rounded-xl border border-dl-sage-light/10 bg-white/[0.03] p-6">
      <div className="flex items-center gap-2.5 mb-2">
        <Mail className="h-4 w-4 text-dl-teal" />
        <p className="text-[15px] font-medium text-dl-cream">Weekly Dependency Digest</p>
      </div>
      <p className="text-[13px] text-dl-sage-light/50 mb-4">
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
            className="flex-1 rounded-lg border border-dl-sage-light/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-dl-cream placeholder:text-dl-sage-light/30 outline-none transition-colors focus:border-dl-teal/50"
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
      <div className="mx-auto max-w-[1200px] px-6 pb-10 pt-16">
        {/* Newsletter Signup Row */}
        <div className="mb-12">
          <NewsletterSignup />
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 rounded-md"
              />
              <span className="text-[17px] font-semibold text-dl-sage-light">DriftLogg</span>
            </Link>
            <p className="mt-3 max-w-[200px] text-[13px] leading-relaxed text-dl-sage-light/55">
              Predict dependency rot before it hits production.
            </p>
            <div className="mt-5">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-dl-hint">
                Founder
              </p>
              <p className="text-[13px] text-dl-sage-light/70">{FOUNDER.name}</p>
              <FounderSocialLinks className="mt-3" />
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <FooterColumn key={col.title} title={col.title} links={col.links} />
          ))}
        </div>

        <div className="mt-12 border-t border-dl-sage-light/10 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-dl-hint">© 2026 DriftLogg. All rights reserved.</p>
            <p className="text-xs text-dl-sage-light/55">
              Built by{' '}
              <a
                href={FOUNDER.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dl-sage-light/80 underline-offset-2 transition-colors hover:text-dl-sage-light hover:underline"
              >
                {FOUNDER.name}
              </a>
              <span className="mx-2 text-dl-sage-light/25">·</span>
              <a
                href={FOUNDER.x}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 transition-colors hover:text-dl-sage-light hover:underline"
              >
                X
              </a>
              <span className="mx-2 text-dl-sage-light/25">·</span>
              <a
                href={FOUNDER.github}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 transition-colors hover:text-dl-sage-light hover:underline"
              >
                GitHub
              </a>
            </p>
            <p className="text-xs italic text-dl-sage-light/40">Built for engineers who ship.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}