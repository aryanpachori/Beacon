'use client'

import * as Tooltip from '@radix-ui/react-tooltip'
import { Clock, Heart, Users } from 'lucide-react'
import type { Package } from '@/types'
import { getSignalLevel, SIGNAL_LEVEL_CLASS } from '@/lib/dashboardData'
import { cn } from '@/lib/utils'

interface PackageSignalIconsProps {
  pkg: Package
}

const SIGNAL_META = [
  {
    key: 'commit' as const,
    icon: Clock,
    label: 'Commit activity',
    getDetail: (p: Package) => {
      const s = p.signals.commitVelocity
      return `Commit velocity: ${s.value}/100 (${s.trend})`
    },
    signal: (p: Package) => p.signals.commitVelocity,
  },
  {
    key: 'sponsor' as const,
    icon: Heart,
    label: 'Sponsor status',
    getDetail: (p: Package) => {
      const s = p.signals.funding
      return `Funding health: ${s.value}/100 (${s.trend})`
    },
    signal: (p: Package) => p.signals.funding,
  },
  {
    key: 'community' as const,
    icon: Users,
    label: 'Community health',
    getDetail: (p: Package) => {
      const s = p.signals.communityHealth
      return `Community: ${s.value}/100 (${s.trend})`
    },
    signal: (p: Package) => p.signals.communityHealth,
  },
]

export function PackageSignalIcons({ pkg }: PackageSignalIconsProps) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="flex items-center gap-2">
        {SIGNAL_META.map(({ key, icon: Icon, getDetail, signal }) => {
          const { value, trend } = signal(pkg)
          const level = getSignalLevel(value, trend)
          return (
            <Tooltip.Root key={key}>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  className={cn('rounded p-0.5', SIGNAL_LEVEL_CLASS[level])}
                  aria-label={getDetail(pkg)}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="z-50 rounded-md border border-dl-m-border bg-dl-card px-2 py-1 text-[11px] text-dl-forest shadow-lg"
                  sideOffset={4}
                >
                  {getDetail(pkg)}
                  <Tooltip.Arrow className="fill-dl-card" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          )
        })}
      </div>
    </Tooltip.Provider>
  )
}
