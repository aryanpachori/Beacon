import type { Package } from '@/types'
import { EcosystemIcon } from '@/components/ui/EcosystemIcon'
import { SPSBadge } from '@/components/ui/SPSBadge'
import { formatNumber } from '@/lib/utils'

interface MigrationCardProps {
  pkg: Package
}

export function MigrationCard({ pkg }: MigrationCardProps) {
  return (
    <div className="dash-card p-5">
      <h3 className="card-heading mb-4 text-base">Migration options</h3>

      {pkg.recommendations.length === 0 ? (
        <p className="text-xs text-dash-muted">No alternatives available for this package.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {pkg.recommendations.map(rec => (
            <div key={rec.name} className="flex items-center justify-between py-2 border-b border-dash-border last:border-0">
              <div className="flex items-center gap-2">
                <EcosystemIcon ecosystem={rec.ecosystem} />
                <span className="text-sm font-medium text-dash-text">{rec.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {rec.weeklyDownloads > 0 && (
                  <span className="text-xs text-dash-muted">{formatNumber(rec.weeklyDownloads)}/wk</span>
                )}
                <SPSBadge sps={rec.sps} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Effort estimate */}
      <div className="mt-4 pt-3 border-t border-dash-border">
        <p className="text-xs text-dash-muted mb-1">Migration effort</p>
        <p className="text-xs text-dash-text">
          Lines impacted: {pkg.effortEstimate.linesImpacted.toLocaleString()} ·{' '}
          Files: {pkg.effortEstimate.filesAffected} ·{' '}
          ~{pkg.effortEstimate.sprintWeeks > 0
            ? `${pkg.effortEstimate.sprintWeeks} sprint week${pkg.effortEstimate.sprintWeeks !== 1 ? 's' : ''}`
            : 'trivial'}
        </p>
      </div>
    </div>
  )
}
