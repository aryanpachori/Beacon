'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import type { Package, Tier } from '@/types'
import { PackageRow } from './PackageRow'
import { FilterTabs } from '@/components/ui/FilterTabs'

type FilterTab = 'all' | Tier

const TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'At risk', value: 'at-risk' },
  { label: 'Watch', value: 'watch' },
  { label: 'Healthy', value: 'healthy' },
]

interface PackageTableProps {
  packages: Package[]
}

export function PackageTable({ packages }: PackageTableProps) {
  const [filter, setFilter] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')

  const visible = packages
    .filter(p => filter === 'all' || p.tier === filter)
    .filter(p =>
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.repoName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.sps - b.sps)

  return (
    <div className="dash-card">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dash-border px-5 py-4">
        <FilterTabs tabs={TABS} value={filter} onChange={setFilter} />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dash-muted" />
          <input
            type="text"
            placeholder="Search packages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="dash-input w-52 pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dash-border">
              {['Package', 'Version', 'Repo', 'Trend', 'SPS', 'Tier', 'Last updated'].map(h => (
                <th key={h} className="dash-section-label px-5 py-3 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((pkg, i) => (
              <PackageRow key={pkg.id} pkg={pkg} index={i} />
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-dash-muted">
                  No packages match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
