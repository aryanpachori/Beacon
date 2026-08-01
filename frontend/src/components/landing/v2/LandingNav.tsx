'use client'

import Link from 'next/link'
import { SiteLogo } from '@/components/layout/SiteLogo'

export function LandingNav() {
  return (
    <nav className="relative z-[5] flex w-full items-center gap-9 py-[26px]">
      <span className="mr-auto">
        <SiteLogo className="text-[19px] font-semibold tracking-[-0.02em] text-[#08090a]" />
      </span>
      <a href="#how" className="hidden text-[14.5px] text-[rgba(8,9,10,.62)] hover:text-[#08090a] md:inline">
        How it works
      </a>
      <a href="#features" className="hidden text-[14.5px] text-[rgba(8,9,10,.62)] hover:text-[#08090a] md:inline">
        Features
      </a>
      <Link href="/pricing" className="hidden text-[14.5px] text-[rgba(8,9,10,.62)] hover:text-[#08090a] md:inline">
        Pricing
      </Link>
      <Link href="/docs" className="hidden text-[14.5px] text-[rgba(8,9,10,.62)] hover:text-[#08090a] md:inline">
        Docs
      </Link>
      <Link
        href="/register"
        className="rounded-full bg-[#08090a] px-4 py-[9px] text-[14px] font-medium text-[#f2f0ed] transition-opacity hover:opacity-80"
      >
        Install Beacon
      </Link>
    </nav>
  )
}
