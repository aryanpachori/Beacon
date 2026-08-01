'use client'

import { useState, useRef, useEffect } from 'react'
import { useAppData } from '@/context/AppDataContext'
import { PackageListRow } from '@/components/packages/PackageListRow'
import { PackageCard } from '@/components/packages/PackageCard'
import { NotificationBell } from '@/components/dashboard/NotificationBell'
import {
  RefreshCw, LayoutList, LayoutGrid, ArrowUpDown, Search, Package as PackageIcon,
} from 'lucide-react'
import Link from 'next/link'
import type { Package, Tier } from '@/types'
import { useDebounce } from '@/hooks/useDebounce'

type FilterTab = 'all' | Tier
type SortKey = 'sps_asc' | 'sps_desc' | 'name_asc' | 'updated_desc'


function avgSps(pkgs: Package[]) {
  const scored = pkgs.filter(p => !p.scoringPending && p.sps > 0)
  if (!scored.length) return null
  return Math.round(scored.reduce((s, p) => s + p.sps, 0) / scored.length)
}

function sortPackages(pkgs: Package[], key: SortKey): Package[] {
  const sorted = [...pkgs]
  switch (key) {
    case 'sps_asc':     return sorted.sort((a, b) => a.sps - b.sps)
    case 'sps_desc':    return sorted.sort((a, b) => b.sps - a.sps)
    case 'name_asc':    return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'updated_desc':return sorted.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
  }
}

export default function PackagesPage() {
  const { packages, repos, loading, error, refresh } = useAppData()
  const [filter, setFilter]   = useState<FilterTab>('all')
  const [search, setSearch]   = useState('')
  const [sort, setSort]       = useState<SortKey>('sps_asc')
  const [view, setView]       = useState<'list' | 'grid'>('list')
  const searchRef             = useRef<HTMLInputElement>(null)
  const debouncedSearch       = useDebounce(search, 300)

  // Cmd+K focuses search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const tierCounts = {
    critical:  packages.filter(p => p.tier === 'critical').length,
    'at-risk':  packages.filter(p => p.tier === 'at-risk').length,
    watch:     packages.filter(p => p.tier === 'watch').length,
    healthy:   packages.filter(p => p.tier === 'healthy').length,
  }
  const avg = avgSps(packages)

  const visible = sortPackages(
    packages
      .filter(p => filter === 'all' || p.tier === filter)
      .filter(p =>
        debouncedSearch === '' ||
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.repoName.toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
    sort
  )

  if (loading) {
    return (
      <div className="app-page flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-dl-blue border-t-transparent" />
          <p className="text-sm text-dl-muted">Loading packages…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-page flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-500">Could not load packages.</p>
        <button type="button" onClick={refresh} className="flex items-center gap-1.5 rounded-xl border border-dl-border px-4 py-2 text-[13px] font-medium text-dl-text hover:bg-dl-surface">
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </button>
      </div>
    )
  }

  return (
    <div className="app-page">
      {/* Header */}
      <div className="mb-5">
        <h1 className="page-heading">Packages</h1>
        <p className="page-description">
          {packages.length} packages across {repos.length} repo{repos.length !== 1 ? 's' : ''}
        </p>
      </div>

      {packages.length === 0 && repos.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dl-border bg-dl-bg px-6 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-dl-blue-pale">
            <PackageIcon className="h-7 w-7 text-dl-blue" />
          </div>
          <p className="text-[15px] font-semibold text-dl-navy">No packages monitored yet</p>
          <p className="mt-1.5 max-w-sm text-sm text-dl-muted">Connect a repository to start monitoring your dependencies.</p>
          <Link href="/repos" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-dl-blue px-5 py-2.5 text-[13px] font-semibold text-[#0b0a08] hover:bg-dl-blue-dark transition-colors">
            Connect a repository
          </Link>
        </div>
      ) : (
        <>
          {/* ── Filter tabs + right controls in one row ── */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            {/* Left: filter tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setFilter('all')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-dl-navy text-dl-bg dark:bg-dl-blue dark:text-[#0b0a08] shadow-sm'
                    : 'border border-dl-border bg-dl-bg text-dl-muted hover:text-dl-text'
                }`}>
                All
              </button>
              <button onClick={() => setFilter(filter === 'critical' ? 'all' : 'critical')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all ${filter === 'critical' ? 'bg-red-500 text-[#0b0a08]' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {tierCounts.critical} critical
              </button>
              {tierCounts['at-risk'] > 0 && (
                <button onClick={() => setFilter(filter === 'at-risk' ? 'all' : 'at-risk')}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all ${filter === 'at-risk' ? 'bg-orange-500 text-[#0b0a08]' : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {tierCounts['at-risk']} at-risk
                </button>
              )}
              {tierCounts.watch > 0 && (
                <button onClick={() => setFilter(filter === 'watch' ? 'all' : 'watch')}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all ${filter === 'watch' ? 'bg-yellow-500 text-[#0b0a08]' : 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20'}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {tierCounts.watch} watch
                </button>
              )}
              {tierCounts.healthy > 0 && (
                <button onClick={() => setFilter(filter === 'healthy' ? 'all' : 'healthy')}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all ${filter === 'healthy' ? 'bg-green-500 text-[#0b0a08]' : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {tierCounts.healthy} healthy
                </button>
              )}
              {avg !== null && (
                <div className="flex items-center gap-1.5 rounded-xl bg-dl-blue-pale px-3 py-1.5 text-[12px] font-semibold text-dl-blue">
                  Avg SPS: {avg}
                </div>
              )}
            </div>

            {/* Right: search + sort + view + refresh + bell */}
            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-dl-border" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search packages…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-8 w-[180px] rounded-xl border border-dl-border bg-dl-bg pl-8 pr-3 text-[12px] text-dl-text placeholder:text-dl-muted outline-none transition-[width] focus:border-dl-blue/40 focus:ring-2 focus:ring-dl-blue/10 focus:w-[240px]"
                />
              </div>
              <div className="relative flex items-center">
                <ArrowUpDown className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-dl-border" />
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value as SortKey)}
                  className="h-8 appearance-none rounded-xl border border-dl-border bg-dl-bg pl-8 pr-6 text-[12px] text-dl-text outline-none focus:border-dl-blue/40"
                >
                  <option value="sps_asc">SPS ↑</option>
                  <option value="sps_desc">SPS ↓</option>
                  <option value="name_asc">Name A–Z</option>
                  <option value="updated_desc">Recently updated</option>
                </select>
              </div>
              <div className="flex overflow-hidden rounded-xl border border-dl-border">
                <button onClick={() => setView('list')}
                  className={`flex h-8 w-8 items-center justify-center transition-colors ${view === 'list' ? 'bg-dl-navy text-dl-bg dark:bg-dl-blue dark:text-[#0b0a08]' : 'bg-dl-bg text-dl-muted hover:bg-dl-surface'}`}>
                  <LayoutList className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setView('grid')}
                  className={`flex h-8 w-8 items-center justify-center transition-colors ${view === 'grid' ? 'bg-dl-navy text-dl-bg dark:bg-dl-blue dark:text-[#0b0a08]' : 'bg-dl-bg text-dl-muted hover:bg-dl-surface'}`}>
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
              </div>
              <button type="button" onClick={refresh} className="flex h-8 w-8 items-center justify-center rounded-xl border border-dl-border text-dl-muted hover:bg-dl-surface hover:text-dl-text transition-colors">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <NotificationBell />
            </div>
          </div>

          {/* ── Column header (list view only) ── */}
          {view === 'list' && visible.length > 0 && (
            <div className="dash-table-header mb-0 hidden items-center gap-4 rounded-t-2xl border border-b-0 border-dl-border px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-dl-muted md:flex">
              <div className="w-[220px] shrink-0">Package</div>
              <div className="hidden w-[120px] shrink-0 sm:block">Repo</div>
              <div className="hidden w-[120px] shrink-0 md:block">Maintainer</div>
              <div className="hidden w-[72px] shrink-0 lg:block">Signals</div>
              <div className="min-w-0 flex-1" />
              <div className="w-10 shrink-0 text-center">SPS</div>
              <div className="hidden w-10 shrink-0 text-center sm:block">Trend</div>
              <div className="hidden w-20 shrink-0 md:block">Tier</div>
              <div className="w-[88px] shrink-0 text-right">Updated</div>
            </div>
          )}

          {/* ── Package rows / cards ── */}
          {visible.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dl-border bg-dl-bg py-14 text-center">
              <PackageIcon className="mb-3 h-8 w-8 text-dl-border" />
              <p className="text-[14px] font-semibold text-dl-navy">No packages found</p>
              <button onClick={() => { setFilter('all'); setSearch('') }}
                className="mt-2 text-[12px] text-dl-blue hover:underline">
                Clear filters
              </button>
            </div>
          ) : view === 'list' ? (
            <div className="overflow-hidden rounded-b-2xl rounded-tr-2xl border border-dl-border bg-dl-bg md:rounded-t-none">
              {visible.map((pkg, i) => (
                <PackageListRow key={pkg.id} pkg={pkg} index={i} searchQuery={debouncedSearch} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((pkg, i) => (
                <PackageCard key={pkg.id} pkg={pkg} index={i} searchQuery={debouncedSearch} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
