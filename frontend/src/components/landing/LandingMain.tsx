'use client'

import { useRef } from 'react'
import { Hero } from '@/components/landing/Hero'
import { StatsCounter } from '@/components/landing/StatsCounter'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { BeforeAfter } from '@/components/landing/BeforeAfter'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { FeatureGrid } from '@/components/landing/FeatureGrid'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { ComparisonTable } from '@/components/landing/ComparisonTable'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { useLandingScroll } from '@/hooks/useLandingScroll'

export function LandingMain() {
  const mainRef = useRef<HTMLElement>(null)
  useLandingScroll(mainRef)

  return (
    <main ref={mainRef} className="landing-scroll-root">
      <Hero />
      <StatsCounter />
      <ProblemSection />
      <BeforeAfter />
      <HowItWorks />
      <FeatureGrid />
      <DashboardPreview />
      <ComparisonTable />
      <FinalCTA />
    </main>
  )
}
