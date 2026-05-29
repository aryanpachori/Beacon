'use client'

import { packages } from '@/lib/mockData'
import { HealthOverviewBar } from '@/components/dashboard/HealthOverviewBar'
import { CriticalPackagesFeed } from '@/components/dashboard/CriticalPackagesFeed'
import { AiSignalPanel } from '@/components/dashboard/AiSignalPanel'
import { PackageTable } from '@/components/packages/PackageTable'

export default function DashboardPage() {
  return (
    <div className="app-page">
      <div className="mb-6">
        <h1 className="page-heading text-dl-forest">Dashboard</h1>
        <p className="page-description text-dl-muted">
          AI health intelligence across your dependency stack
        </p>
      </div>

      <HealthOverviewBar />

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[65fr_35fr]">
        <CriticalPackagesFeed />
        <AiSignalPanel />
      </div>

      <section>
        <p className="dash-section-label mb-4">ALL PACKAGES</p>
        <PackageTable packages={packages} variant="dashboard" />
      </section>
    </div>
  )
}
