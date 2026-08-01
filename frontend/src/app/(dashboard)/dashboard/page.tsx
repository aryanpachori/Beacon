'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useAppData } from '@/context/AppDataContext'
import { OverviewIntegrations } from '@/components/dashboard/OverviewIntegrations'
import { AgentActivityHeatmap } from '@/components/dashboard/AgentActivityHeatmap'

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
  if (plan === 'pro') return { bg: 'rgba(255,137,76,0.14)', text: '#ffa06b', dot: '#ff894c' }
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

      {/* ── Header row: greeting + plan/account, single compact line ── */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight text-dl-navy">
            {greeting}, {firstName}
          </h1>
          <p className="page-description">
            {scanComplete
              ? 'Beacon is watching your stack in real time.'
              : 'Connect GitHub to let Beacon start watching your stack.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-dl-border bg-dl-bg px-2.5 py-1.5 text-[11px] font-medium text-dl-text">
            <span className="h-1.5 w-1.5 rounded-full bg-dl-healthy" />
            {user?.email}
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold"
            style={{ background: planColors.bg, color: planColors.text }}
          >
            {planLabel(plan)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <AgentActivityHeatmap />
        <OverviewIntegrations />
      </div>

      {packages.length > 0 && (
        <Link
          href="/dependency-tracker"
          className="dl-card mt-4 flex items-center justify-between transition-colors hover:border-dl-muted"
        >
          <div className="flex items-center gap-4 text-[12.5px] text-dl-text">
            <span className="font-semibold text-dl-navy">{dashboard?.totalPackages ?? packages.length} packages</span>
            <span className="text-dl-muted">·</span>
            <span>{dashboard?.healthCounts?.critical ?? 0} critical</span>
            <span className="text-dl-muted">·</span>
            <span>{dashboard?.healthCounts?.atRisk ?? 0} at-risk</span>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-medium text-dl-blue">
            View Dependency Tracker <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      )}
    </div>
  )
}
