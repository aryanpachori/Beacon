import type { Package } from '@/types'
import { getMaintainerProfiles, getMaintainerBarClass } from '@/lib/packageDetailData'
import { cn } from '@/lib/utils'

interface MaintainerProfileCardsProps {
  pkg: Package
  className?: string
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function MaintainerProfileCards({ pkg, className }: MaintainerProfileCardsProps) {
  const profiles = getMaintainerProfiles(pkg)

  return (
    <section className={cn('mb-6', className)}>
      <p className="dash-section-label mb-3">Maintainer profiles</p>
      <div
        className={cn(
          'grid gap-3',
          profiles.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
        )}
      >
        {profiles.map(profile => (
          <div
            key={profile.handle}
            className="dash-card flex min-w-0 flex-col p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dl-teal/20 text-[16px] font-medium text-dl-teal"
                aria-hidden
              >
                {initials(profile.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-dl-forest">{profile.name}</p>
                <p className="truncate font-mono text-[11px] text-dl-hint">{profile.handle}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-[12px]">
              <div className="flex justify-between gap-2">
                <dt className="text-dl-muted">Last commit</dt>
                <dd className="font-medium text-dl-forest">{profile.lastCommitDays}d ago</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-dl-muted">Public repos</dt>
                <dd className="font-medium text-dl-forest">{profile.publicRepos}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-dl-muted">Sponsor</dt>
                <dd className="font-medium text-dl-forest">{profile.sponsor}</dd>
              </div>
            </dl>
            <div
              className="signal-bar-track mt-4"
              title={`Last activity ${profile.lastCommitDays} days ago`}
            >
              <div className={cn('h-full w-full', getMaintainerBarClass(profile.lastCommitDays))} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
