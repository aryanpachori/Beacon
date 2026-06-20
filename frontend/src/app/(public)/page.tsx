import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/landing/Hero'
import { StatsCounter } from '@/components/landing/StatsCounter'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { BeforeAfter } from '@/components/landing/BeforeAfter'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { FeatureGrid } from '@/components/landing/FeatureGrid'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { ComparisonTable } from '@/components/landing/ComparisonTable'
import { FinalCTA } from '@/components/landing/FinalCTA'

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
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
      <Footer />
    </>
  )
}
