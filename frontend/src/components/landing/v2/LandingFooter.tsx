'use client'

import Link from 'next/link'
import { SiteLogo } from '@/components/layout/SiteLogo'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '/#how' },
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Install',
    links: [
      { label: 'VS Code', href: '/register' },
      { label: 'Cursor', href: '/register' },
      { label: 'MCP server', href: '/register' },
      { label: 'CLI', href: '/register' },
    ],
  },
]

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.828L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  )
}

export function LandingFooter() {
  return (
    <footer className="overflow-hidden border-t border-white/10 bg-black pt-[74px] text-[#f8f8f8]">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 pb-0 md:grid-cols-2 md:px-10 lg:grid-cols-[1fr_auto_auto_auto] lg:gap-14">
        <div>
          <div className="mb-[26px]">
            <SiteLogo
              variant="onDark"
              size={40}
              wordmarkClassName="text-[22px] font-semibold tracking-[-0.025em] text-[#f8f8f8]"
            />
          </div>
          <p className="m-0 text-[14px] text-[rgba(248,248,248,.55)]">
            © 2026 Beacon. All rights reserved.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-3.5 lg:justify-self-end">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[rgba(248,248,248,.55)]">
              {col.title}
            </span>
            {col.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-base font-medium text-[#f8f8f8] transition-colors hover:text-white/60"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}

        <div className="flex flex-col gap-3.5 lg:justify-self-end">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[rgba(248,248,248,.55)]">
            Social
          </span>
          <a
            href="https://x.com/trybeaconai"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Beacon on X"
            className="inline-flex h-8 w-8 items-center justify-center text-[rgba(248,248,248,.55)] transition-colors hover:text-[#f8f8f8]"
          >
            <XIcon className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="mt-12 flex h-[clamp(90px,12vw,250px)] justify-center overflow-hidden sm:mt-[78px]">
        <span className="whitespace-nowrap text-[clamp(120px,22vw,440px)] font-semibold leading-[0.74] tracking-[-0.055em] text-[#f8f8f8]">
          beacon
        </span>
      </div>
    </footer>
  )
}
