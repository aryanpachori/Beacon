'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { adaptPackageListItem } from '@/lib/adapters'
import { useAppData } from '@/context/AppDataContext'
import { CriticalPackageCard } from '@/components/dashboard/CriticalPackageCard'
import type { Package } from '@/types'

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
}

function pickAttentionPackages(packages: Package[]): Package[] {
  const scored = packages
    .filter(p => !p.scoringPending && (p.tier === 'critical' || p.tier === 'at-risk'))
    .sort((a, b) => a.sps - b.sps)

  if (scored.length > 0) return scored.slice(0, 5)

  return [...packages]
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 5)
}

export function CriticalPackagesFeed() {
  const { packages, dashboard } = useAppData()

  const fromDashboard =
    dashboard?.criticalPackages?.map(p =>
      adaptPackageListItem({
        ...p,
        tier: p.tier,
        sps: p.sps,
        lastUpdated: p.lastUpdated ?? new Date().toISOString(),
        version: p.version ?? '*',
        repoName: p.repoName ?? '',
        signals: p.signals,
      })
    ) ?? []

  const topRisk =
    fromDashboard.length > 0 ? fromDashboard.slice(0, 5) : pickAttentionPackages(packages)

  const scoringPending = packages.some(p => p.scoringPending)

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0, x: 16 },
        show: { opacity: 1, x: 0, transition: { staggerChildren: 0.1 } },
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="dash-section-label">
          {scoringPending && topRisk.some(p => p.scoringPending)
            ? 'SCANNED PACKAGES'
            : 'NEEDS ATTENTION'}
        </p>
        <Link href="/packages" className="text-[12px] font-medium text-[#5B6E4C] hover:text-[#40502F] transition-colors">
          View all →
        </Link>
      </div>

      {topRisk.length === 0 ? (
        <div className="dash-card px-4 py-8 text-center text-sm text-dl-muted">
          No packages yet. Complete GitHub onboarding to populate this feed.
        </div>
      ) : (
        <motion.div variants={listVariants}>
          {topRisk.map(pkg => (
            <CriticalPackageCard key={pkg.id} pkg={pkg} />
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
