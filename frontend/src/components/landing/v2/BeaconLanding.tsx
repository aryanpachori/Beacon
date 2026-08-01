'use client'

import { useEffect } from 'react'
import { LandingNav } from './LandingNav'
import { LandingHero } from './LandingHero'
import { TrustStrip } from './TrustStrip'
import { Pipeline } from './Pipeline'
import { Features } from './Features'
import { LandingCTA } from './LandingCTA'
import { LandingFooter } from './LandingFooter'

function useScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.beacon-landing [data-reveal]'))
    const show = (el: HTMLElement) => el.classList.add('is-visible')

    let io: IntersectionObserver | null = null
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              show(e.target as HTMLElement)
              io?.unobserve(e.target)
            }
          })
        },
        { threshold: 0.08 }
      )
      els.forEach((el) => io!.observe(el))
    }

    const fallback = window.setTimeout(() => els.forEach(show), 2500)
    return () => {
      io?.disconnect()
      window.clearTimeout(fallback)
    }
  }, [])
}

export function BeaconLanding({
  demoSpeed = 1,
  showTrustStrip = true,
}: {
  demoSpeed?: number
  showTrustStrip?: boolean
}) {
  useScrollReveal()

  return (
    <div className="beacon-landing">
      <div className="bl-shell">
        <LandingNav />
        <LandingHero demoSpeed={demoSpeed} />
        {showTrustStrip && <TrustStrip />}
        <Pipeline demoSpeed={demoSpeed} />
        <Features />
        <LandingCTA />
      </div>
      <LandingFooter />
    </div>
  )
}
