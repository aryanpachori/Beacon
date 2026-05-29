'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { packages } from '@/lib/mockData'
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
  const pkg = packages.find(p => p.id === params.id)
  if (!pkg) notFound()

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
