'use client'

import { Zap, Package as PackageIcon } from 'lucide-react'
import { useAppData } from '@/context/AppDataContext'
import { HealthOverviewBar } from '@/components/dashboard/HealthOverviewBar'
import { NotificationBell } from '@/components/dashboard/NotificationBell'
import { InsightsDashboard } from '@/components/dashboard/InsightsDashboard'

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
  if (plan === 'pro') return { bg: '#eaf2fd', text: '#2f7eda', dot: '#2f7eda' }
  if (plan === 'team') return { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a' }
  return { bg: '#f5f7fa', text: '#9fa0b5', dot: '#9fa0b5' }
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
          <div className="h-8 w-8 rounded-full border-2 border-[#2f7eda] border-t-transparent animate-spin" />
          <p className="text-sm text-[#9fa0b5]">Loading your stack…</p>
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
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-135 p-px"
        style={{
          background: 'linear-gradient(135deg, #2f7eda 0%, #1a5fb4 100%)',
        }}
      >
        <div className="relative overflow-hidden rounded-2xl px-8 py-7"
          style={{
            background: 'linear-gradient(135deg, #1e3a6e 0%, #1a2f56 60%, #0f1e3a 100%)',
          }}
        >
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
            style={{ background: 'rgba(47,126,218,0.25)' }} />
          <div className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full blur-2xl"
            style={{ background: 'rgba(91,159,232,0.15)' }} />
          <div className="pointer-events-none absolute right-1/3 top-0 h-px w-64 opacity-30"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />

          <div className="relative z-10 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                  <Zap className="h-3 w-3 text-[#5b9fe8]" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5b9fe8]">
                  {greeting}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Welcome back, {firstName}!
              </h1>
              <p className="mt-1 text-sm text-white/50">
                {scanComplete
                  ? 'Your dependency health is being monitored in real-time.'
                  : 'Connect GitHub to start monitoring your dependencies.'}
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
        <NotificationBell />
      </div>

      {packages.length === 0 ? (
        <div className="dash-card flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf2fd]">
            <PackageIcon className="h-7 w-7 text-[#2f7eda]" />
          </div>
          <p className="text-[15px] font-semibold text-[#1e2a3c]">No packages yet</p>
          <p className="mt-2 max-w-md text-sm text-[#9fa0b5]">
            Complete GitHub onboarding to scan your repos. Packages appear here after signal
            collection — SPS scores arrive once the intelligence service finishes scoring.
          </p>
        </div>
      ) : (
        <>
          {/* ── Health overview (ring + trend + stats) ── */}
          <div className="mb-6">
            <HealthOverviewBar />
          </div>

          {/* ── Full analytics dashboard ── */}
          <InsightsDashboard />
        </>
      )}
    </div>
  )
}
