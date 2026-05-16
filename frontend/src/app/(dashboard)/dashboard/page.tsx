'use client'

import { packages } from '@/lib/mockData'
import { StatCard } from '@/components/ui/StatCard'
import { PackageTable } from '@/components/packages/PackageTable'
import { PageHeader } from '@/components/ui/PageHeader'

export default function DashboardPage() {
  const critical = packages.filter(p => p.tier === 'critical').length
  const atRisk   = packages.filter(p => p.tier === 'at-risk').length
  const watch    = packages.filter(p => p.tier === 'watch').length
  const avgSps   = Math.round(packages.reduce((s, p) => s + p.sps, 0) / packages.length)

  return (
    <div className="app-page">
      <PageHeader
        title="Dashboard"
        description="Monitoring 3 repos · Last updated 4 minutes ago"
      />

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total packages" value={packages.length} />
        <StatCard label="Critical" value={critical} accent="var(--dl-critical)" />
        <StatCard label="At risk" value={atRisk} accent="var(--dl-risk)" />
        <StatCard label="Avg SPS" value={avgSps} sub={`${watch} watching`} />
      </div>

      <PackageTable packages={packages} />
    </div>
  )
}
