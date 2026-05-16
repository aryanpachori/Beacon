import type { Repo } from '@/types'
import { TierChip } from '@/components/ui/TierChip'
import { SPSBadge } from '@/components/ui/SPSBadge'
import { timeAgo } from '@/lib/utils'

interface RepoCardProps {
  repo: Repo
}

export function RepoCard({ repo }: RepoCardProps) {
  return (
    <div className="rounded-lg border border-dash-border bg-dash-surface p-4 flex flex-col gap-4">
      {/* Org/name */}
      <div>
        <p className="text-xs text-dash-muted font-mono">{repo.org}/</p>
        <p className="text-sm font-bold text-dash-text font-mono">{repo.name}</p>
      </div>

      {/* Stats 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-dash-muted mb-0.5">Packages</p>
          <p className="text-lg font-bold font-mono text-dash-text">{repo.packageCount}</p>
        </div>
        <div>
          <p className="text-xs text-dash-muted mb-0.5">Avg SPS</p>
          <SPSBadge sps={repo.avgSps} />
        </div>
        <div>
          <p className="text-xs text-dash-muted mb-0.5">Last scan</p>
          <p className="text-xs text-dash-text">{timeAgo(repo.connectedAt)}</p>
        </div>
        <div>
          <p className="text-xs text-dash-muted mb-0.5">Critical</p>
          <p className="text-lg font-bold font-mono text-dl-critical">
            {repo.worstPackage.tier === 'critical' ? '1+' : '0'}
          </p>
        </div>
      </div>

      {/* Worst package */}
      <div className="pt-3 border-t border-dash-border flex items-center justify-between">
        <div>
          <p className="text-xs text-dash-muted mb-0.5">Worst package</p>
          <p className="text-sm font-medium text-dash-text">{repo.worstPackage.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <TierChip tier={repo.worstPackage.tier} />
          <SPSBadge sps={repo.worstPackage.sps} />
        </div>
      </div>
    </div>
  )
}
