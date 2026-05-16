'use client'

import { packages } from '@/lib/mockData'
import { StatCard } from '@/components/ui/StatCard'
import { PackageTable } from '@/components/packages/PackageTable'

export default function DashboardPage() {
  const critical = packages.filter(p => p.tier === 'critical').length
  const atRisk   = packages.filter(p => p.tier === 'at-risk').length
  const watch    = packages.filter(p => p.tier === 'watch').length
  const avgSps   = Math.round(packages.reduce((s, p) => s + p.sps, 0) / packages.length)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-dl-text">Dashboard</h1>
        <p className="text-sm text-dl-muted mt-0.5">Monitoring 3 repos · Last updated 4 minutes ago</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total packages" value={packages.length} />
        <StatCard label="Critical" value={critical} accent="var(--dl-critical)" />
        <StatCard label="At risk"  value={atRisk}   accent="var(--dl-risk)" />
        <StatCard label="Avg SPS"  value={avgSps}   sub={`${watch} watching`} />
      </div>

      <PackageTable packages={packages} />
    </div>
  )
}
