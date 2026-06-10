'use client'

import { useAppData } from '@/context/AppDataContext'
import { PackageTable } from '@/components/packages/PackageTable'

export default function PackagesPage() {
  const { packages, repos, loading, error } = useAppData()

  if (loading) {
    return (
      <div className="app-page flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-dl-muted">Loading packages…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-page flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-dl-critical">{error}</p>
      </div>
    )
  }

  return (
    <div className="app-page">
      <div className="mb-6">
        <h1 className="page-heading text-dl-forest">All packages</h1>
        <p className="page-description text-dl-muted">
          {packages.length} packages across {repos.length} repos
        </p>
      </div>

      {packages.length === 0 ? (
        <div className="dash-card px-6 py-12 text-center text-sm text-dl-muted">
          No packages found. Finish GitHub onboarding to scan your dependency manifests.
        </div>
      ) : (
        <PackageTable packages={packages} />
      )}
    </div>
  )
}
