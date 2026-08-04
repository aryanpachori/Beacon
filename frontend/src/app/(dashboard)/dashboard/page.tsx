'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useAppData } from '@/context/AppDataContext'
import { fetchOnboardingState } from '@/lib/api'
import { OverviewIntegrations } from '@/components/dashboard/OverviewIntegrations'
import { AgentActivityHeatmap } from '@/components/dashboard/AgentActivityHeatmap'
import { QuickStartChecklist } from '@/components/dashboard/QuickStartChecklist'

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

function planColor() {
  return { bg: '#111111', text: '#ffffff' }
}


export default function DashboardPage() {
  const { user, packages, loading, error, dashboard } = useAppData()
  const greeting = getGreeting()
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'there'
  const firstName = displayName.split(' ')[0]
  const plan = user?.plan ?? 'free'
  const planColors = planColor()
  const [githubConnected, setGithubConnected] = useState(false)

  useEffect(() => {
    fetchOnboardingState().then((s) => setGithubConnected(s.connected)).catch(() => {})
  }, [])

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
          <h1 className="page-heading !text-[34px]">
            {greeting}, {firstName}
          </h1>
          <p className="page-description">
            {scanComplete
              ? 'Beacon is watching your stack in real time.'
              : 'Connect GitHub to let Beacon start watching your stack.'}
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="flex min-w-0 max-w-full items-center gap-2 rounded-full border border-dl-border px-3.5 py-2 text-[13px] text-dl-muted">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-dl-navy" />
            <span className="truncate">{user?.email}</span>
          </span>
          <span
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-semibold"
            style={{ background: planColors.bg, color: planColors.text, fontFamily: 'var(--font-heading)' }}
          >
            {planLabel(plan)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <AgentActivityHeatmap />
        <div className="flex flex-col gap-4">
          <OverviewIntegrations />
          <QuickStartChecklist githubConnected={githubConnected} agentConnected={false} />
        </div>
      </div>

      {packages.length > 0 && (
        <Link
          href="/dependency-tracker"
          className="dl-card mt-4 flex flex-col gap-3 transition-colors hover:border-dl-muted sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-dl-text">
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
