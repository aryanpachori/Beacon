'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package as PackageIcon, GitBranch, Users, BarChart2, Lock, ArrowRight } from 'lucide-react'
import { useAppData } from '@/context/AppDataContext'
import { fetchOnboardingState, fetchMaintainers, type MaintainerOverview } from '@/lib/api'
import { PackageListRow } from '@/components/packages/PackageListRow'
import { RepoCard } from '@/components/repos/RepoCard'
import { InsightsDashboard } from '@/components/dashboard/InsightsDashboard'
import { cn } from '@/lib/utils'

type Tab = 'packages' | 'repos' | 'maintainers' | 'analytics'

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'packages', label: 'Packages', icon: PackageIcon },
  { key: 'repos', label: 'Repos', icon: GitBranch },
  { key: 'maintainers', label: 'Maintainers', icon: Users },
  { key: 'analytics', label: 'Analytics', icon: BarChart2 },
]

function LockedCard({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dl-border bg-dl-bg py-16 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-dl-surface">
        <Lock className="h-5 w-5 text-dl-border" />
      </div>
      <p className="text-[13px] font-semibold text-dl-navy">Connect GitHub for {label}</p>
      <p className="mt-1 max-w-xs text-[12px] text-dl-muted">
        This view populates from your connected repositories — no sample data.
      </p>
      <Link href="/onboarding" className="btn-dash-primary mt-4 flex items-center gap-1.5 !text-[12px]">
        Connect GitHub
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

function MaintainersTab({ connected }: { connected: boolean }) {
  const [maintainers, setMaintainers] = useState<MaintainerOverview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!connected) {
      setLoading(false)
      return
    }
    fetchMaintainers().then(setMaintainers).catch(() => {}).finally(() => setLoading(false))
  }, [connected])

  if (!connected) return <LockedCard label="maintainer risk data" />
  if (loading) return <p className="text-[12px] text-dl-muted">Loading maintainers…</p>
  if (maintainers.length === 0) {
    return <p className="text-[12px] text-dl-muted">No maintainer data yet — run a scan first.</p>
  }

  return (
    <div className="divide-y divide-dl-border rounded-xl border border-dl-border bg-dl-bg">
      {maintainers.map((m) => (
        <div key={m.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-[12.5px] font-semibold text-dl-navy">{m.displayName ?? m.login}</p>
            <p className="text-[11px] text-dl-muted">@{m.login}</p>
          </div>
          <span className="text-[11px] text-dl-muted">{m.packages.length} package(s)</span>
        </div>
      ))}
    </div>
  )
}

export default function DependencyTrackerPage() {
  const { packages, repos, loading } = useAppData()
  const [tab, setTab] = useState<Tab>('packages')
  const [connected, setConnected] = useState<boolean | null>(null)

  useEffect(() => {
    fetchOnboardingState()
      .then((s) => setConnected(s.connected))
      .catch(() => setConnected(false))
  }, [])

  return (
    <div className="app-page">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="page-heading">Dependency Tracker</h2>
          <p className="page-description">Packages, repos, maintainers and analytics — one combined view</p>
        </div>
      </div>

      <div className="mb-5 flex items-center gap-1.5 overflow-x-auto pb-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all',
              tab === key
                ? 'bg-dl-navy text-dl-bg dark:bg-dl-blue dark:text-[#f8f8f8]'
                : 'border border-dl-border text-dl-muted hover:border-dl-muted hover:text-dl-text'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'packages' && (
        loading ? (
          <p className="text-[12px] text-dl-muted">Loading packages…</p>
        ) : packages.length === 0 ? (
          <LockedCard label="package health data" />
        ) : (
          <div className="divide-y divide-dl-border rounded-xl border border-dl-border bg-dl-bg">
            {packages.map((pkg, i) => (
              <PackageListRow key={pkg.id} pkg={pkg} index={i} />
            ))}
          </div>
        )
      )}

      {tab === 'repos' && (
        loading ? (
          <p className="text-[12px] text-dl-muted">Loading repos…</p>
        ) : repos.length === 0 ? (
          <LockedCard label="repo monitoring" />
        ) : (
          <div className="flex flex-col gap-3">
            {repos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        )
      )}

      {tab === 'maintainers' && <MaintainersTab connected={connected ?? false} />}

      {tab === 'analytics' && (
        connected === null ? (
          <p className="text-[12px] text-dl-muted">Checking connection…</p>
        ) : connected ? (
          <InsightsDashboard />
        ) : (
          <LockedCard label="analytics" />
        )
      )}
    </div>
  )
}
