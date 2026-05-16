'use client'

import { packages } from '@/lib/mockData'
import { PackageTable } from '@/components/packages/PackageTable'

export default function PackagesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-dl-text">All packages</h1>
        <p className="text-sm text-dl-muted mt-0.5">{packages.length} packages across 3 repos</p>
      </div>
      <PackageTable packages={packages} />
    </div>
  )
}
