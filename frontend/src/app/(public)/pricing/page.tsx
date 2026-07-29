'use client'

import { useState } from 'react'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { PricingHero } from '@/components/pricing/PricingHero'
import { PricingCards, type BillingPeriod } from '@/components/pricing/PricingCards'
import { FeatureComparison } from '@/components/pricing/FeatureComparison'
import { PricingFAQ } from '@/components/pricing/PricingFAQ'
import { PricingCTA } from '@/components/pricing/PricingCTA'

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')

  return (
    <div className="site-shell min-h-screen">
      <Nav />
      <main>
        <PricingHero />
        <PricingCards billingPeriod={billingPeriod} onBillingChange={setBillingPeriod} />
        <FeatureComparison />
        <PricingFAQ />
        <PricingCTA />
      </main>
      <Footer />
    </div>
  )
}
