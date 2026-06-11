'use client'

import { Sparkles } from 'lucide-react'
import { useAppData } from '@/context/AppDataContext'
import { HealthOverviewBar } from '@/components/dashboard/HealthOverviewBar'
import { CriticalPackagesFeed } from '@/components/dashboard/CriticalPackagesFeed'
import { AiSignalPanel } from '@/components/dashboard/AiSignalPanel'
import { PackageTable } from '@/components/packages/PackageTable'
import { NotificationBell } from '@/components/dashboard/NotificationBell'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function planLabel(plan: string) {
  if (plan === 'pro') return 'Pro Plan'
  if (plan === 'team') return 'Team Plan'
  return 'Free Plan'
}

export default function DashboardPage() {
  const { user, packages, loading, error, dashboard } = useAppData()
  const greeting = getGreeting()
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'there'
  const scanComplete =
    dashboard?.scanStatus === 'complete' ||
    dashboard?.scanStatus === 'scoring' ||
    (dashboard?.scanProgress?.scanned ?? 0) > 0

  if (loading) {
    return (
      <div className="app-page flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-dl-muted">Loading your stack…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-page flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-dl-critical">{error}</p>
      </div>
    )
  }

  return (
    <div className="app-page">
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-dl-m-border/40 bg-gradient-to-br from-[#1c3b38] via-[#243f3c] to-[#142e2b] px-7 py-6 shadow-lg">
        <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-dl-teal/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-dl-sage-light/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-dl-sage-light" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-dl-sage-light">
                {greeting}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Hope you&apos;re having a good day, {displayName.split(' ')[0]}!
            </h1>
            <p className="text-sm text-white/60 mt-0.5">
              Signed in as{' '}
              <span className="text-dl-sage-light font-medium">{user?.email}</span>
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex flex-col items-start sm:items-end gap-1">
            <span className="text-[11px] uppercase tracking-wider text-white/40 font-medium">
              Account
            </span>
            <span className="text-sm font-semibold text-white">{displayName}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-dl-teal/30 bg-dl-teal/10 px-3 py-0.5 text-[11px] font-medium text-dl-sage-light">
              <span className="h-1.5 w-1.5 rounded-full bg-dl-sage-light inline-block" />
              {planLabel(user?.plan ?? 'free')}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="page-heading text-dl-forest">Dashboard</h2>
          <p className="page-description text-dl-muted">
            {scanComplete
              ? 'Live data from your connected repositories'
              : 'Connect GitHub to start monitoring your dependencies'}
          </p>
        </div>
        <NotificationBell />
      </div>

      {packages.length === 0 ? (
        <div className="dash-card flex flex-col items-center justify-center px-6 py-16 text-center">
          <p className="text-[15px] font-medium text-dl-forest">No packages yet</p>
          <p className="mt-2 max-w-md text-sm text-dl-muted">
            Complete GitHub onboarding to scan your repos. Packages appear here after signal
            collection — SPS scores arrive once the intelligence service finishes scoring.
          </p>
        </div>
      ) : (
        <>
          <HealthOverviewBar />

          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[65fr_35fr]">
            <CriticalPackagesFeed />
            <AiSignalPanel />
          </div>

          <section>
            <p className="dash-section-label mb-4">ALL PACKAGES</p>
            <PackageTable packages={packages} variant="dashboard" />
          </section>
        </>
      )}
    </div>
  )
}
