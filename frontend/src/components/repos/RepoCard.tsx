import type { Repo } from '@/types'
import { TierChip } from '@/components/ui/TierChip'
import { SPSBadge } from '@/components/ui/SPSBadge'
import { timeAgo } from '@/lib/utils'

interface RepoCardProps {
  repo: Repo
}

export function RepoCard({ repo }: RepoCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[14px] border border-dash-border bg-dash-surface p-5">
      <div>
        <p className="text-xs font-mono text-dash-muted">{repo.org}/</p>
        <p className="text-sm font-medium font-mono text-dash-text">{repo.name}</p>
      </div>

      {/* Stats 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-dash-muted mb-0.5">Packages</p>
          <p className="stat-value text-lg">{repo.packageCount}</p>
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
          <p className="stat-value text-lg text-dl-critical">
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
