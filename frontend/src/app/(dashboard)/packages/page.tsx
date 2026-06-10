'use client'

import { useAppData } from '@/context/AppDataContext'
import { PackageTable } from '@/components/packages/PackageTable'
import { RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function PackagesPage() {
  const { packages, repos, loading, error, refresh } = useAppData()

  if (loading) {
    return (
      <div className="app-page flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-dl-muted">Loading packages…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-page flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-dl-critical">Could not load packages. Check your connection.</p>
        <button
          type="button"
          onClick={refresh}
          className="btn-dash-secondary flex items-center gap-1.5 text-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="app-page">
      <div className="mb-6">
        <h1 className="page-heading text-dl-forest">All packages</h1>
        <p className="page-description text-dl-muted">
          {packages.length} packages across {repos.length} repo{repos.length !== 1 ? 's' : ''}
        </p>
      </div>

      {packages.length === 0 && repos.length === 0 ? (
        <div className="dash-card flex flex-col items-center px-6 py-14 text-center">
          <p className="text-[14px] font-medium text-dl-forest">No packages monitored yet</p>
          <p className="mt-1 text-[13px] text-dl-muted">Connect a repository to start monitoring</p>
          <Link href="/repos" className="btn-dash-primary mt-4">
            Connect a repository
          </Link>
        </div>
      ) : (
        <PackageTable packages={packages} />
      )}
    </div>
  )
}
