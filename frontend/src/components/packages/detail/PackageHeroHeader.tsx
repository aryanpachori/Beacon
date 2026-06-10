'use client'

import type { ReactNode } from 'react'
import type { Package } from '@/types'
import { Heart, Wrench, AlertTriangle, ArrowRight, Copy, CheckCircle } from 'lucide-react'
import { EcosystemIcon } from '@/components/ui/EcosystemIcon'
import {
  getPackageDescription,
  getStatusBadges,
  getOpenIssues,
  getDaysSinceCommit,
  getSpsColorClass,
  type PackageStatusBadge,
} from '@/lib/packageDetailData'
import { cn } from '@/lib/utils'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

const BADGE_ICONS = {
  heart: Heart,
  tool: Wrench,
  alert: AlertTriangle,
  arrow: ArrowRight,
}

const BADGE_ICON_COLORS: Record<PackageStatusBadge['id'], string> = {
  sponsor: 'text-[#E07070]',
  maint: 'text-[#D4963A]',
  dep: 'text-[#E07070]',
  succ: 'text-[#5BBEC8]',
}

function getBadgeIconColor(badge: PackageStatusBadge): string {
  if (badge.variant === 'healthy') return 'text-[#5BBEC8]'
  if (badge.variant === 'teal') return 'text-[#5BBEC8]'
  return BADGE_ICON_COLORS[badge.id] ?? 'text-dl-muted'
}

interface PackageHeroHeaderProps {
  pkg: Package
}

function HeroStat({
  value,
  label,
  valueClassName,
  suffix,
}: {
  value: ReactNode
  label: string
  valueClassName?: string
  suffix?: ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col items-center px-3 text-center">
      <div className={cn('flex items-center justify-center gap-1 text-[28px] font-medium tabular-nums', valueClassName)}>
        {value}
        {suffix}
      </div>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-dl-muted">{label}</p>
    </div>
  )
}

export function PackageHeroHeader({ pkg }: PackageHeroHeaderProps) {
  const badges = getStatusBadges(pkg)
  const openIssues = getOpenIssues(pkg)
  const commit = getDaysSinceCommit(pkg)
  const spsColor = getSpsColorClass(pkg)
  const { copy, copied } = useCopyToClipboard()
  const IssueTrend =
    openIssues.trend === 'up' ? TrendingUp : openIssues.trend === 'down' ? TrendingDown : Minus
  const issueTrendClass =
    openIssues.trend === 'up'
      ? 'text-dl-critical'
      : openIssues.trend === 'down'
        ? 'text-dl-healthy'
        : 'text-dl-muted'

  return (
    <div className="dash-card mb-6 overflow-hidden p-5">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-8">
        <div className="flex min-w-0 gap-4">
          <EcosystemIcon
            ecosystem={pkg.ecosystem}
            className="h-12 w-12 min-w-12 shrink-0 rounded-lg text-[14px]"
          />
          <div className="min-w-0">
            <h1 className="text-[22px] font-medium text-dl-forest">{pkg.name}</h1>
            <button
              onClick={() => copy(`${pkg.name}@${pkg.version}`)}
              title="Copy package@version"
              className="mt-0.5 flex items-center gap-1 font-mono text-[12px] text-dl-hint hover:text-dl-teal transition-colors"
            >
              <span>v{pkg.version}</span>
              {copied
                ? <CheckCircle className="h-3 w-3 text-dl-teal" />
                : <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100" />
              }
            </button>
            <span className="mt-2 inline-flex rounded-full border border-dl-teal/20 bg-dl-teal/10 px-2.5 py-0.5 text-[11px] font-medium uppercase text-dl-teal">
              {pkg.ecosystem}
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between">
          <p className="max-w-[320px] line-clamp-2 text-[13px] leading-relaxed text-dl-muted">
            {getPackageDescription(pkg)}
          </p>
          <div className="mt-5 flex items-stretch">
            <HeroStat value={pkg.sps} label="SPS" valueClassName={spsColor} />
            <div className="w-px shrink-0 self-stretch bg-[rgba(255,255,255,0.07)]" aria-hidden />
            <HeroStat value={commit.days} label="Days since commit" valueClassName={commit.colorClass} />
            <div className="w-px shrink-0 self-stretch bg-[rgba(255,255,255,0.07)]" aria-hidden />
            <HeroStat
              value={openIssues.count}
              label="Open issues"
              valueClassName="text-dl-forest"
              suffix={<IssueTrend className={cn('h-4 w-4', issueTrendClass)} aria-hidden />}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2.5 lg:justify-center">
          {badges.map(badge => {
            const Icon = BADGE_ICONS[badge.icon]
            return (
              <div key={badge.id} className="status-badge">
                <span className="min-w-0 flex-1 break-words">{badge.label}</span>
                <Icon className={cn('h-3.5 w-3.5 shrink-0', getBadgeIconColor(badge))} aria-hidden />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
