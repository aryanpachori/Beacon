'use client'

import Link from 'next/link'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { MobilePublicNav } from '@/components/layout/MobilePublicNav'

const LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
]

export function LandingNav() {
  return (
    <nav className="relative z-[5] flex w-full items-center gap-3 py-5 sm:gap-5 sm:py-[26px] md:gap-9">
      <SiteLogo
        className="mr-auto"
        size={36}
        wordmarkClassName="text-[20px] font-semibold tracking-[-0.02em] text-[#08090a] sm:text-[22px]"
      />

      <a
        href="#how"
        className="hidden text-[14.5px] text-[rgba(8,9,10,.62)] transition-colors hover:text-[#08090a] md:inline"
      >
        How it works
      </a>
      <a
        href="#features"
        className="hidden text-[14.5px] text-[rgba(8,9,10,.62)] transition-colors hover:text-[#08090a] md:inline"
      >
        Features
      </a>
      <Link
        href="/pricing"
        className="hidden text-[14.5px] text-[rgba(8,9,10,.62)] transition-colors hover:text-[#08090a] md:inline"
      >
        Pricing
      </Link>
      <Link
        href="/docs"
        className="hidden text-[14.5px] text-[rgba(8,9,10,.62)] transition-colors hover:text-[#08090a] md:inline"
      >
        Docs
      </Link>
      <Link
        href="/get-started"
        className="bl-btn-primary !rounded-full !px-3.5 !py-2 text-[13px] sm:!px-4 sm:!py-[9px] sm:text-[14px]"
      >
        Install Beacon
      </Link>

      <MobilePublicNav links={LINKS} />
    </nav>
  )
}
