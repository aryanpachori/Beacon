'use client'

import { packages, repos } from '@/lib/mockData'
import { PackageTable } from '@/components/packages/PackageTable'

export default function PackagesPage() {
  return (
    <div className="app-page">
      <div className="mb-6">
        <h1 className="page-heading text-dl-forest">All packages</h1>
        <p className="page-description text-dl-muted">
          {packages.length} packages across {repos.length} repos
        </p>
      </div>

      <PackageTable packages={packages} />
    </div>
  )
}
