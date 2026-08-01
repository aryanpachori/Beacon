'use client'

import { Zap, Package as PackageIcon } from 'lucide-react'
import { useAppData } from '@/context/AppDataContext'
import { HealthOverviewBar } from '@/components/dashboard/HealthOverviewBar'
import { InsightsDashboard } from '@/components/dashboard/InsightsDashboard'
import { OverviewIntegrations } from '@/components/dashboard/OverviewIntegrations'

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

function planColor(plan: string) {
  if (plan === 'pro') return { bg: 'rgba(255,102,0,0.14)', text: '#ff8533', dot: '#ff6600' }
  if (plan === 'team') return { bg: 'rgba(169,128,90,0.18)', text: '#C9A47C', dot: '#A9805A' }
  return { bg: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.7)', dot: 'rgba(255,255,255,0.5)' }
}


export default function DashboardPage() {
  const { user, packages, loading, error, dashboard } = useAppData()
  const greeting = getGreeting()
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'there'
  const firstName = displayName.split(' ')[0]
  const plan = user?.plan ?? 'free'
  const planColors = planColor(plan)

  const scanComplete =
    dashboard?.scanStatus === 'complete' ||
    dashboard?.scanStatus === 'scoring' ||
    (dashboard?.scanProgress?.scanned ?? 0) > 0

  if (loading) {
    return (
      <div className="app-page flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-dl-blue border-t-transparent animate-spin" />
          <p className="text-sm text-dl-muted">Loading your stack…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-page flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="app-page">

      {/* ── Hero greeting banner ── */}
      <div className="relative mb-8 overflow-hidden rounded-2xl p-px"
        style={{
          background: 'linear-gradient(135deg, rgba(122,134,68,0.35) 0%, rgba(255,255,255,0.06) 100%)',
        }}
      >
        <div className="relative overflow-hidden rounded-2xl px-8 py-7"
          style={{
            background: 'linear-gradient(135deg, #14171A 0%, #0E1012 60%, #0A0B0D 100%)',
          }}
        >
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
            style={{ background: 'rgba(122,134,68,0.16)' }} />
          <div className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full blur-2xl"
            style={{ background: 'rgba(169,128,90,0.10)' }} />
          <div className="pointer-events-none absolute right-1/3 top-0 h-px w-64 opacity-30"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />

          <div className="relative z-10 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                  <Zap className="h-3 w-3 text-[#ff8533]" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#ff8533]">
                  {greeting}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Welcome back, {firstName}!
              </h1>
              <p className="mt-1 text-sm text-white/50">
                {scanComplete
                  ? 'Beacon is watching your stack in real time.'
                  : 'Connect GitHub to let Beacon start watching your stack.'}
              </p>
            </div>

            <div className="mt-5 flex flex-col items-start gap-2 sm:mt-0 sm:items-end">
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
                <div className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-[12px] font-semibold text-white/90">{user?.email}</span>
              </div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
                style={{ background: planColors.bg, color: planColors.text }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: planColors.dot }} />
                {planLabel(plan)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section header ── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="page-heading">Overview</h2>
          <p className="page-description">
            {scanComplete
              ? 'Live data from your connected repositories'
              : 'Connect GitHub to start monitoring your dependencies'}
          </p>
        </div>
      </div>

      {packages.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <div className="dash-card flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-dl-blue-pale">
              <PackageIcon className="h-7 w-7 text-dl-blue" />
            </div>
            <p className="text-[15px] font-semibold text-dl-navy">No packages yet</p>
            <p className="mt-2 max-w-md text-sm text-dl-muted">
              Complete GitHub onboarding to let Beacon scan your repos. Health scores appear here
              once signal collection and scoring finish — usually within a few minutes.
            </p>
          </div>
          <OverviewIntegrations />
        </div>
      ) : (
        <>
          {/* ── Health overview (ring + trend + stats) ── */}
          <div className="mb-6">
            <HealthOverviewBar />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
            {/* ── Full analytics dashboard ── */}
            <InsightsDashboard />
            <OverviewIntegrations />
          </div>
        </>
      )}
    </div>
  )
}
