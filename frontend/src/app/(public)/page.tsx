import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/landing/Hero'
import { SocialProof } from '@/components/landing/SocialProof'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { FeatureGrid } from '@/components/landing/FeatureGrid'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { Testimonials } from '@/components/landing/Testimonials'
import { ComparisonTable } from '@/components/landing/ComparisonTable'
import { FinalCTA } from '@/components/landing/FinalCTA'

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <SocialProof />
        <ProblemSection />
        <HowItWorks />
        <FeatureGrid />
        <DashboardPreview />
        <Testimonials />
        <ComparisonTable />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
