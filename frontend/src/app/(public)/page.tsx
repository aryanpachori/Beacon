import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { LandingMain } from '@/components/landing/LandingMain'
import { LandingBackgroundVideo } from '@/components/landing/LandingBackgroundVideo'

export default function HomePage() {
  return (
    <div className="landing-with-video relative">
      <LandingBackgroundVideo />
      <div className="relative z-10">
        <Nav />
        <LandingMain />
        <Footer />
      </div>
    </div>
  )
}
