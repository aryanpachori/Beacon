'use client'

import { packages, repos } from '@/lib/mockData'
import { PackageTable } from '@/components/packages/PackageTable'
import { PageHeader } from '@/components/ui/PageHeader'

export default function PackagesPage() {
  return (
    <div className="app-page">
      <PageHeader
        title="All packages"
        description={`${packages.length} packages across ${repos.length} repos`}
      />
      <PackageTable packages={packages} />
    </div>
  )
}
