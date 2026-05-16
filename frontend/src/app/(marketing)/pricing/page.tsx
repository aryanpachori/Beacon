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
    <>
      <Nav />
      <main>
        <PricingHero billingPeriod={billingPeriod} onBillingChange={setBillingPeriod} />
        <PricingCards billingPeriod={billingPeriod} />
        <FeatureComparison />
        <PricingFAQ />
        <PricingCTA />
      </main>
      <Footer />
    </>
  )
}
