'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Package } from '@/types'
import { EcosystemIcon } from '@/components/ui/EcosystemIcon'
import { SPSBadge } from '@/components/ui/SPSBadge'
import { TierChip } from '@/components/ui/TierChip'
import { SparklineLine } from '@/components/ui/SparklineLine'
import { timeAgo } from '@/lib/utils'

interface PackageRowProps {
  pkg: Package
  index: number
}

export function PackageRow({ pkg, index }: PackageRowProps) {
  const last30 = pkg.spsHistory.slice(-30)

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className="border-b border-dl-border hover:bg-white/3 transition-colors cursor-pointer"
    >
      <td className="px-4 py-3">
        <Link href={`/packages/${pkg.id}`} className="flex items-center gap-2">
          <EcosystemIcon ecosystem={pkg.ecosystem} />
          <span className="text-sm font-medium text-dl-text hover:underline">{pkg.name}</span>
        </Link>
      </td>
      <td className="px-4 py-3 text-sm text-dl-muted font-mono">{pkg.version}</td>
      <td className="px-4 py-3 text-sm text-dl-muted">{pkg.repoName.split('/')[1]}</td>
      <td className="px-4 py-3">
        <SparklineLine data={last30} tier={pkg.tier} />
      </td>
      <td className="px-4 py-3">
        <SPSBadge sps={pkg.sps} />
      </td>
      <td className="px-4 py-3">
        <TierChip tier={pkg.tier} />
      </td>
      <td className="px-4 py-3 text-xs text-dl-muted">{timeAgo(pkg.lastUpdated)}</td>
    </motion.tr>
  )
}
