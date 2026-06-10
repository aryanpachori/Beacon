import { Suspense } from 'react'
import { OnboardingFlow } from './OnboardingFlow'

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="site-shell flex min-h-screen items-center justify-center text-sm text-dl-m-muted">
          Loading…
        </div>
      }
    >
      <OnboardingFlow />
    </Suspense>
  )
}
