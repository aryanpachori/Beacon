'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Package, Tier } from '@/types'
import { EcosystemIcon } from '@/components/ui/EcosystemIcon'
import { TierChip } from '@/components/ui/TierChip'
import { SPSBadge } from '@/components/ui/SPSBadge'
import { getAiReason, getRiskPills } from '@/lib/dashboardData'
import { cn } from '@/lib/utils'

const TIER_LEFT_BORDER: Record<Tier, string> = {
  critical: 'border-l-dl-critical',
  'at-risk': 'border-l-dl-risk',
  watch: 'border-l-dl-watch',
  healthy: 'border-l-dl-healthy',
}

interface CriticalPackageCardProps {
  pkg: Package
}

export function CriticalPackageCard({ pkg }: CriticalPackageCardProps) {
  const pills = getRiskPills(pkg)

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0 },
      }}
    >
      <Link
        href={`/packages/${pkg.id}`}
        className={cn(
          'dash-card mb-3 block border-l-[3px] transition-colors hover:border-dl-teal',
          TIER_LEFT_BORDER[pkg.tier]
        )}
      >
        <div className="mb-2 flex items-center gap-2">
          <EcosystemIcon ecosystem={pkg.ecosystem} className="h-8 min-w-8 text-[11px]" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] font-medium text-dl-forest">{pkg.name}</span>
              <span className="font-mono text-[11px] text-dl-hint">v{pkg.version}</span>
            </div>
          </div>
          <TierChip tier={pkg.tier} />
          <SPSBadge score={pkg.sps} tier={pkg.tier} size="md" />
        </div>

        <p className="mb-3 text-[12px] leading-relaxed text-dl-muted">{getAiReason(pkg)}</p>

        <div className="flex flex-wrap gap-1.5">
          {pills.map(pill => (
            <span
              key={pill}
              className="rounded-full bg-dl-teal/10 px-2 py-0.5 text-[10px] text-dl-muted"
            >
              {pill}
            </span>
          ))}
        </div>
      </Link>
    </motion.div>
  )
}
