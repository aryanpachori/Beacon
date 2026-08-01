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

export function LandingFooter() {
  return (
    <footer className="overflow-hidden bg-[#ff6600] pt-[74px] text-[#0b0a08]">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 pb-0 md:grid-cols-2 md:px-10 lg:grid-cols-[1fr_auto_auto] lg:gap-14">
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
          <p className="m-0 text-[14px] text-[rgba(11,10,8,.72)]">
            © 2026 Beacon. All rights reserved.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-3.5 lg:justify-self-end">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[rgba(11,10,8,.85)]">
              {col.title}
            </span>
            {col.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="bl-on-orange text-base font-medium text-[#0b0a08] transition-opacity hover:opacity-55"
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
