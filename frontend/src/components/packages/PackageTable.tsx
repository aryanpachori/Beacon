'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import type { Package, Tier } from '@/types'
import { PackageRow } from './PackageRow'
import { cn } from '@/lib/utils'

type FilterTab = 'all' | Tier

const TABS: { label: string; value: FilterTab }[] = [
  { label: 'All',     value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'At risk',  value: 'at-risk' },
  { label: 'Watch',    value: 'watch' },
  { label: 'Healthy',  value: 'healthy' },
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
    <div className="rounded-lg border border-dash-border bg-dash-surface overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-dash-border">
        <div className="flex items-center gap-1">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                'px-3 py-1 rounded text-xs font-medium transition-colors',
                filter === tab.value
                  ? 'bg-white/10 text-dash-text'
                  : 'text-dash-muted hover:text-dash-text'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dash-muted" />
          <input
            type="text"
            placeholder="Search packages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded text-xs bg-white/5 border border-dash-border text-dash-text placeholder-dl-muted focus:outline-none focus:border-white/20 w-48"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dash-border">
              {['Package', 'Version', 'Repo', 'Trend', 'SPS', 'Tier', 'Last updated'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-dash-muted uppercase tracking-wide">
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
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-dash-muted">
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
