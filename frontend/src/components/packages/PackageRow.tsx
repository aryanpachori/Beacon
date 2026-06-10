'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Package } from '@/types'
import { EcosystemIcon } from '@/components/ui/EcosystemIcon'
import { SPSBadge } from '@/components/ui/SPSBadge'
import { TierChip } from '@/components/ui/TierChip'
import { SparklineLine } from '@/components/ui/SparklineLine'
import { SparklineBar } from '@/components/ui/SparklineBar'
import { PackageSignalIcons } from '@/components/dashboard/PackageSignalIcons'
import { timeAgo } from '@/lib/utils'
import {
  getMaintainerHandle,
  getMaintainerActivity,
  MAINTAINER_DOT_CLASS,
  formatLastUpdatedLabel,
  getLastUpdatedColorClass,
} from '@/lib/dashboardData'
import { cn } from '@/lib/utils'

interface PackageRowProps {
  pkg: Package
  index: number
  variant?: 'default' | 'dashboard'
}

export function PackageRow({ pkg, index, variant = 'default' }: PackageRowProps) {
  const last30 = pkg.spsHistory.slice(-30)
  const last5 = pkg.spsHistory.slice(-5)
  const isDashboard = variant === 'dashboard'
  const maintainer = getMaintainerHandle(pkg)
  const activity = getMaintainerActivity(pkg.lastUpdated)

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className="group dash-table-row relative last:border-0"
    >
      <td className="px-4 py-3">
        <Link href={`/packages/${pkg.id}`} className="flex items-center gap-2">
          <EcosystemIcon ecosystem={pkg.ecosystem} />
          <span className="text-[13px] font-medium text-dl-forest hover:underline">{pkg.name}</span>
        </Link>
      </td>
      <td className="px-4 py-3 font-mono text-[13px] text-dl-forest">{pkg.version}</td>
      <td className="px-4 py-3 text-[13px] text-dl-forest">{pkg.repoName.split('/')[1]}</td>
      {isDashboard && (
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', MAINTAINER_DOT_CLASS[activity])} />
            <span className="max-w-[72px] truncate font-mono text-[11px] text-dl-hint">
              {maintainer}
            </span>
          </div>
        </td>
      )}
      <td className="px-4 py-3">
        {isDashboard ? (
          <SparklineBar data={last5} tier={pkg.tier} />
        ) : (
          <SparklineLine data={last30} tier={pkg.tier} />
        )}
      </td>
      {isDashboard && (
        <td className="px-4 py-3">
          <PackageSignalIcons pkg={pkg} />
        </td>
      )}
      <td className="px-4 py-3">
        {pkg.scoringPending ? (
          <span className="text-[13px] text-dl-muted">Pending</span>
        ) : (
          <SPSBadge score={pkg.sps} tier={pkg.tier} size="sm" />
        )}
      </td>
      <td className="px-4 py-3">
        {pkg.scoringPending ? (
          <span className="text-[11px] text-dl-muted">Scoring…</span>
        ) : (
          <TierChip tier={pkg.tier} />
        )}
      </td>
      <td className="px-4 py-3">
        {isDashboard ? (
          <span className={cn('text-[13px]', getLastUpdatedColorClass(pkg.lastUpdated))}>
            {formatLastUpdatedLabel(pkg.lastUpdated)}
          </span>
        ) : (
          <span className="text-[13px] text-dl-forest">{timeAgo(pkg.lastUpdated)}</span>
        )}
      </td>
      {isDashboard && (
        <td className="px-4 py-3 text-right">
          <span className="text-[11px] text-dl-teal opacity-0 transition-opacity group-hover:opacity-100">
            View details →
          </span>
        </td>
      )}
    </motion.tr>
  )
}
