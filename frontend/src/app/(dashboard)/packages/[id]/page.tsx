'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Download, Star, GitFork, Shield, ExternalLink } from 'lucide-react'
import { fetchPackageById } from '@/lib/api'
import type { Package } from '@/types'
import { PackageHeroHeader } from '@/components/packages/detail/PackageHeroHeader'
import { PackageDetailLinks } from '@/components/packages/detail/PackageDetailLinks'
import { SpsSurvivalChart } from '@/components/packages/detail/SpsSurvivalChart'
import { DossierSignalCard } from '@/components/packages/detail/DossierSignalCard'
import { AiVerdictCard } from '@/components/packages/detail/AiVerdictCard'
import { PackageMigrationPanel } from '@/components/packages/detail/PackageMigrationPanel'
import { MaintainerProfileCards } from '@/components/packages/detail/MaintainerProfileCards'
import { PackageAlertHistory } from '@/components/packages/detail/PackageAlertHistory'

interface PageProps {
  params: { id: string }
}

export default function PackageDetailPage({ params }: PageProps) {
  const [pkg, setPkg] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchPackageById(params.id)
        if (!cancelled) setPkg(data)
      } catch {
        if (!cancelled) setMissing(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="app-page flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-dl-muted">Loading package…</p>
      </div>
    )
  }

  if (missing || !pkg) notFound()

  const signalEntries = Object.entries(pkg.signals) as [
    keyof typeof pkg.signals,
    (typeof pkg.signals)[keyof typeof pkg.signals],
  ][]

  return (
    <div className="app-page">
      <Link
        href="/packages"
        className="mb-6 flex items-center gap-1 text-[13px] text-dl-muted transition-colors hover:text-dl-forest"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All packages
      </Link>

      {/* ── Deprecation banner ── */}
      {pkg.isDeprecated && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-[#fef2f2] px-4 py-3.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-red-700">This package is deprecated</p>
            {pkg.successorPackage && (
              <p className="mt-0.5 text-[12px] text-red-500">
                Successor: <span className="font-bold">{pkg.successorPackage}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {pkg.scoringPending && (
        <div className="mb-5 rounded-2xl border border-[#2f7eda]/20 bg-[#eaf2fd] px-4 py-3 text-[13px] text-[#2f7eda]">
          Signals collected. SPS score and tier will appear after the intelligence service finishes scoring.
        </div>
      )}

      {/* ── Extended stats strip (downloads, stars, forks, license, CVEs) ── */}
      {(pkg.weeklyDownloads || pkg.totalStars || pkg.totalForks || pkg.license || (pkg.signalFacts?.cveCount ?? 0) > 0) && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {pkg.weeklyDownloads && (
            <div className="flex items-center gap-1.5 rounded-xl border border-[#e4e8ee] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#555663]">
              <Download className="h-3.5 w-3.5 text-[#9fa0b5]" />
              {pkg.weeklyDownloads >= 1_000_000
                ? `${(pkg.weeklyDownloads / 1_000_000).toFixed(1)}M`
                : pkg.weeklyDownloads >= 1_000
                  ? `${(pkg.weeklyDownloads / 1_000).toFixed(0)}K`
                  : pkg.weeklyDownloads.toLocaleString()
              } / week
            </div>
          )}
          {(pkg.totalStars ?? 0) > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl border border-[#e4e8ee] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#555663]">
              <Star className="h-3.5 w-3.5 text-[#ca8a04]" />
              {(pkg.totalStars ?? 0).toLocaleString()}
            </div>
          )}
          {(pkg.totalForks ?? 0) > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl border border-[#e4e8ee] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#555663]">
              <GitFork className="h-3.5 w-3.5 text-[#9fa0b5]" />
              {(pkg.totalForks ?? 0).toLocaleString()}
            </div>
          )}
          {pkg.license && (
            <div className="flex items-center gap-1.5 rounded-xl border border-[#e4e8ee] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#555663]">
              <Shield className="h-3.5 w-3.5 text-[#2f7eda]" />
              {pkg.license}
            </div>
          )}
          {(pkg.signalFacts?.cveCount ?? 0) > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-[#fef2f2] px-3 py-1.5 text-[12px] font-semibold text-red-500">
              <Shield className="h-3.5 w-3.5" />
              {pkg.signalFacts!.cveCount} CVE{pkg.signalFacts!.cveCount !== 1 ? 's' : ''}
            </div>
          )}
          {pkg.githubRepoUrl && (
            <a href={pkg.githubRepoUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-[#e4e8ee] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#9fa0b5] hover:text-[#2f7eda] hover:border-[#2f7eda]/30 transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
              GitHub
            </a>
          )}
        </div>
      )}

      <PackageHeroHeader pkg={pkg} />
      <PackageDetailLinks pkg={pkg} />

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,58fr)_minmax(0,40fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <SpsSurvivalChart pkg={pkg} />
          <div className="grid auto-rows-fr grid-cols-2 gap-3">
            {signalEntries.map(([key, signal]) => (
              <DossierSignalCard key={key} pkg={pkg} signalKey={key} signal={signal} />
            ))}
          </div>
          <MaintainerProfileCards pkg={pkg} className="mb-0" />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <AiVerdictCard pkg={pkg} />
          <PackageMigrationPanel pkg={pkg} />
        </div>
      </div>

      <PackageAlertHistory pkg={pkg} />
    </div>
  )
}
