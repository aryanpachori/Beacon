'use client'

import { useEffect } from 'react'
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import '@/styles/beacon-landing.css'
import { LandingNav } from './LandingNav'
import { LandingHero } from './LandingHero'
import { TrustStrip } from './TrustStrip'
import { Pipeline } from './Pipeline'
import { StoryTimeline } from './StoryTimeline'
import { Features } from './Features'
import { LandingCTA } from './LandingCTA'
import { LandingFooter } from './LandingFooter'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-sans',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

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
    <div
      className={`beacon-landing ${instrumentSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <div className="bl-shell">
        <LandingNav />
        <LandingHero demoSpeed={demoSpeed} />
        {showTrustStrip && <TrustStrip />}
        <Pipeline demoSpeed={demoSpeed} />
        <StoryTimeline demoSpeed={demoSpeed} />
        <Features />
        <LandingCTA />
      </div>
      <LandingFooter />
    </div>
  )
}
