'use client'

import { useState } from 'react'
import type { Package, Tier } from '@/types'
import { PackageRow } from './PackageRow'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { ArrowUp, ArrowDown } from 'lucide-react'

type FilterTab = 'all' | Tier

const TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'At risk', value: 'at-risk' },
  { label: 'Watch', value: 'watch' },
  { label: 'Healthy', value: 'healthy' },
]

const DEFAULT_HEADERS = ['Package', 'Version', 'Repo', 'Trend', 'SPS', 'Tier', 'Last updated']
const DASHBOARD_HEADERS = [
  'Package',
  'Version',
  'Repo',
  'Maintainer',
  'Trend',
  'Signals',
  'SPS',
  'Tier',
  'Last updated',
  '',
]

interface PackageTableProps {
  packages: Package[]
  variant?: 'default' | 'dashboard'
}

export function PackageTable({ packages, variant = 'default' }: PackageTableProps) {
  const [filter, setFilter] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [spsSort, setSpsSort] = useState<'asc' | 'desc'>('asc')
  const isDashboard = variant === 'dashboard'
  const headers = isDashboard ? DASHBOARD_HEADERS : DEFAULT_HEADERS

  const handleSortSps = () => {
    setSpsSort(prev => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const visible = packages
    .filter(p => filter === 'all' || p.tier === filter)
    .filter(
      p =>
        search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.repoName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      return spsSort === 'asc' ? a.sps - b.sps : b.sps - a.sps
    })

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <FilterTabs tabs={TABS} value={filter} onChange={setFilter} />
        <input
          type="text"
          placeholder="Search packages..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="dash-input w-[200px]"
        />
      </div>

      <div className="dash-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="dash-table-header">
                {headers.map(h => {
                  const isSps = h === 'SPS'
                  return (
                    <th
                      key={h || 'actions'}
                      onClick={isSps ? handleSortSps : undefined}
                      className={`dash-section-label px-4 py-3 text-left ${
                        isSps ? 'cursor-pointer select-none hover:text-dl-forest transition-colors' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{h}</span>
                        {isSps && (
                          spsSort === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5 text-dl-teal shrink-0" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-dl-teal shrink-0" />
                          )
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {visible.map((pkg, i) => (
                <PackageRow key={pkg.id} pkg={pkg} index={i} variant={variant} />
              ))}
              {visible.length === 0 && (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="px-4 py-12 text-center text-[13px] text-dl-muted"
                  >
                    No packages match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
