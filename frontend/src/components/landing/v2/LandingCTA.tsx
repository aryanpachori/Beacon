'use client'

import Link from 'next/link'

export function LandingCTA() {
  return (
    <section data-reveal className="relative px-1 py-10 pb-16 text-center sm:py-[26px] sm:pb-[120px]">
      <h2 className="relative mx-auto mb-[18px] max-w-[20ch] text-[clamp(30px,8vw,58px)] font-semibold leading-[1.05] tracking-[-0.035em]">
        Let your AI ship faster. Let Beacon{' '}
        <span className="bl-serif font-normal italic text-[#08090a]">watch</span>.
      </h2>
      <p className="relative mx-auto mb-8 max-w-[46ch] text-[15px] text-[rgba(8,9,10,.55)] sm:text-[17px]">
        Free to install. No repo access. Live in your editor before your next prompt finishes.
      </p>
      <div className="relative flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Link href="/get-started" className="bl-btn-primary !px-6 !py-3.5">
          Install Beacon — free
        </Link>
        <a href="mailto:founders@beacon.forgefastlabs.com" className="bl-btn-ghost !px-[22px] !py-3.5">
          Talk to us
        </a>
      </div>
    </section>
  )
}
