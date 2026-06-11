'use client'

import { useState, useEffect, useRef } from 'react'
import type { Package, Tier } from '@/types'
import { PackageRow } from './PackageRow'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { ArrowUp, ArrowDown, Package as PackageIcon, Loader2 } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

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
  const [searchFocused, setSearchFocused] = useState(false)
  const [spsSort, setSpsSort] = useState<'asc' | 'desc'>('asc')
  const searchRef = useRef<HTMLInputElement>(null)
  const isDashboard = variant === 'dashboard'
  const headers = isDashboard ? DASHBOARD_HEADERS : DEFAULT_HEADERS

  const debouncedSearch = useDebounce(search, 300)
  const isDebouncing = search !== debouncedSearch

  // Cmd+K focuses search; Escape clears it
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        setSearch('')
        searchRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSortSps = () => {
    setSpsSort(prev => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const visible = packages
    .filter(p => filter === 'all' || p.tier === filter)
    .filter(
      p =>
        debouncedSearch === '' ||
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.repoName.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    .sort((a, b) => {
      return spsSort === 'asc' ? a.sps - b.sps : b.sps - a.sps
    })

  const noResults = visible.length === 0
  const hasActiveFilter = filter !== 'all' || debouncedSearch !== ''

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <FilterTabs tabs={TABS} value={filter} onChange={setFilter} />
        <div className="relative flex items-center w-full sm:w-auto">
          <input
            id="package-search"
            ref={searchRef}
            type="text"
            placeholder={searchFocused && search ? 'Press Enter to search or wait…' : 'Search by package name…'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="dash-input w-full sm:w-[200px] pr-16 transition-[width] duration-200 sm:focus:w-[280px]"
          />
          <div className="pointer-events-none absolute right-2 flex items-center gap-1">
            {isDebouncing ? (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-dl-teal/60" />
            ) : search && !isDebouncing ? (
              <Loader2 className="h-3 w-3 animate-spin text-dl-hint" />
            ) : !searchFocused ? (
              <span className="rounded border border-dl-border px-1 py-0.5 font-mono text-[10px] text-dl-hint">⌘K</span>
            ) : null}
          </div>
        </div>
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
                <PackageRow key={pkg.id} pkg={pkg} index={i} variant={variant} searchQuery={debouncedSearch} />
              ))}
              {noResults && (
                <tr>
                  <td colSpan={headers.length} className="px-4 py-14 text-center">
                    {hasActiveFilter ? (
                      <div className="flex flex-col items-center gap-2">
                        <PackageIcon className="h-9 w-9 text-dl-hint opacity-40" />
                        <p className="text-[14px] font-medium text-dl-forest">
                          No {filter !== 'all' ? filter : ''} packages{debouncedSearch ? ` matching "${debouncedSearch}"` : ''} found
                        </p>
                        <button
                          onClick={() => { setFilter('all'); setSearch('') }}
                          className="text-[12px] text-dl-teal hover:underline"
                        >
                          Clear filter
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <PackageIcon className="h-9 w-9 text-dl-hint opacity-40" />
                        <p className="text-[14px] font-medium text-dl-forest">No packages monitored yet</p>
                        <p className="text-[13px] text-dl-muted">Connect a repository to start monitoring</p>
                      </div>
                    )}
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
