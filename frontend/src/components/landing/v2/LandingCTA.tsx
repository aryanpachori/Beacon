'use client'

import Link from 'next/link'

export function LandingCTA() {
  return (
    <section data-reveal className="relative py-[26px] pb-[120px] text-center">
      <h2 className="relative mx-auto mb-[18px] max-w-[20ch] text-[clamp(36px,5.5vw,58px)] font-semibold leading-[1.05] tracking-[-0.035em]">
        Let your AI ship faster. Let Beacon{' '}
        <span className="bl-serif font-normal italic text-[#ff6600]">watch</span>.
      </h2>
      <p className="relative mx-auto mb-8 max-w-[46ch] text-[17px] text-[rgba(242,240,237,.55)]">
        Free to install. No repo access. Live in your editor before your next prompt finishes.
      </p>
      <div className="relative flex flex-wrap justify-center gap-3">
        <Link href="/register" className="bl-btn-primary !px-6 !py-3.5">
          Install Beacon — free
        </Link>
        <a href="mailto:hello@beaconapp.dev" className="bl-btn-ghost !px-[22px] !py-3.5">
          Talk to us
        </a>
      </div>
    </section>
  )
}
