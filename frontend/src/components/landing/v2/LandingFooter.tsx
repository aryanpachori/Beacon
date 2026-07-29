'use client'

import Link from 'next/link'
import Image from 'next/image'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '#how' },
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Changelog', href: '#' },
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
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: 'mailto:hello@beaconapp.dev' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Security', href: '#' },
      { label: 'Subprocessors', href: '#' },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer className="overflow-hidden bg-[#ff6600] pt-[74px] text-[#0b0a08]">
      <div className="bl-shell grid gap-10 pb-0 md:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)] lg:gap-10">
        <div>
          <div className="mb-[26px] flex items-center gap-2.5">
            <Image
              src="/beacon-mark.png"
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 shrink-0 object-contain"
            />
            <span className="text-[20px] font-semibold tracking-[-0.025em] text-[#0b0a08]">beacon</span>
          </div>
          <div className="mb-[26px] flex gap-[18px] text-[14.5px] font-medium">
            <a href="https://github.com" className="bl-on-orange text-[#0b0a08] hover:opacity-60">
              GitHub
            </a>
            <a href="https://x.com" className="bl-on-orange text-[#0b0a08] hover:opacity-60">
              X
            </a>
            <a href="https://linkedin.com" className="bl-on-orange text-[#0b0a08] hover:opacity-60">
              LinkedIn
            </a>
          </div>
          <p className="m-0 text-[14px] text-[rgba(11,10,8,.72)]">
            © 2026 Beacon. All rights reserved.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-3.5">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[rgba(11,10,8,.85)]">
              {col.title}
            </span>
            {col.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="bl-on-orange text-base font-medium text-[#0b0a08] hover:opacity-60"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-[78px] flex h-[clamp(130px,14vw,250px)] justify-center overflow-hidden">
        <span className="whitespace-nowrap text-[clamp(190px,24vw,440px)] font-semibold leading-[0.74] tracking-[-0.055em] text-[#0b0a08]">
          beacon
        </span>
      </div>
    </footer>
  )
}
