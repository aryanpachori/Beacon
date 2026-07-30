'use client'

import Image from 'next/image'
import Link from 'next/link'

export function LandingNav() {
  return (
    <nav className="relative z-[5] flex items-center gap-5 py-[26px] md:gap-9">
      <Link href="/" className="mr-auto flex items-center gap-[11px]">
        <Image
          src="/beacon-mark.png"
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 shrink-0 object-contain"
          priority
        />
        <span className="text-[19px] font-semibold tracking-[-0.02em]">beacon</span>
      </Link>

      <div className="hidden items-center gap-9 md:flex">
        <a href="#how" className="text-[14.5px] text-[rgba(242,240,237,.62)] transition-colors hover:text-[#ff6600]">
          How it works
        </a>
        <a href="#features" className="text-[14.5px] text-[rgba(242,240,237,.62)] transition-colors hover:text-[#ff6600]">
          Features
        </a>
        <Link href="/pricing" className="text-[14.5px] text-[rgba(242,240,237,.62)] transition-colors hover:text-[#ff6600]">
          Pricing
        </Link>
        <Link href="/docs" className="text-[14.5px] text-[rgba(242,240,237,.62)] transition-colors hover:text-[#ff6600]">
          Docs
        </Link>
      </div>

      <Link
        href="/register"
        className="bl-on-orange rounded-full bg-[#ff6600] px-4 py-[9px] text-[14px] font-medium text-[#0b0a08] transition-colors hover:bg-[#ff8533] hover:text-[#0b0a08]"
      >
        Install Beacon
      </Link>
    </nav>
  )
}
