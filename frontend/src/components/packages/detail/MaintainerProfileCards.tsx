import type { Package } from '@/types'
import { getMaintainerProfiles, getMaintainerBarClass } from '@/lib/packageDetailData'
import { cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

interface MaintainerProfileCardsProps {
  pkg: Package
  className?: string
}

function initials(name: string): string {
  return name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function activityBadge(days: number) {
  if (days < 30)  return { label: 'Active',    color: '#16a34a', bg: '#f0fdf4' }
  if (days < 90)  return { label: 'Moderate',  color: '#ca8a04', bg: '#fefce8' }
  return               { label: 'Inactive',   color: '#dc2626', bg: '#fef2f2' }
}

export function MaintainerProfileCards({ pkg, className }: MaintainerProfileCardsProps) {
  const profiles = getMaintainerProfiles(pkg)

  return (
    <section className={cn('mb-6', className)}>
      <p className="dash-section-label mb-3">Maintainer profiles</p>
      <div className={cn('grid gap-3', profiles.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')}>
        {profiles.map(profile => {
          const badge = activityBadge(profile.lastCommitDays)
          const login = profile.handle.replace('@', '')
          return (
            <div key={profile.handle} className="overflow-hidden rounded-2xl border border-dl-border bg-dl-bg p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2f7eda] to-[#1a5fb4] text-[14px] font-bold text-white">
                  {initials(profile.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[13px] font-bold text-dl-navy">{profile.name}</p>
                  <a
                    href={`https://github.com/${login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-mono text-[11px] text-dl-muted hover:text-[#2f7eda] transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {profile.handle}
                  </a>
                </div>
                <span className="rounded-lg px-2 py-1 text-[10px] font-bold" style={{ background: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>
              </div>

              <dl className="mt-4 space-y-2 text-[12px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-dl-muted">Last commit</dt>
                  <dd className="font-semibold" style={{ color: badge.color }}>{profile.lastCommitDays}d ago</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-dl-muted">Public repos</dt>
                  <dd className="font-semibold text-dl-navy">{profile.publicRepos}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-dl-muted">Sponsor</dt>
                  <dd className="font-semibold text-dl-navy">{profile.sponsor}</dd>
                </div>
              </dl>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-dl-surface" title={`Last activity ${profile.lastCommitDays} days ago`}>
                <div className={cn('h-full', getMaintainerBarClass(profile.lastCommitDays))} style={{ width: `${Math.max(5, 100 - Math.min(profile.lastCommitDays, 100))}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
