import Link from 'next/link'
import type { Package } from '@/types'
import { EcosystemIcon } from '@/components/ui/EcosystemIcon'
import { SPSBadge } from '@/components/ui/SPSBadge'
import { spsToTier } from '@/lib/constants'
import { formatNumber } from '@/lib/utils'

interface MigrationCardProps {
  pkg: Package
}

export function MigrationCard({ pkg }: MigrationCardProps) {
  return (
    <>
      <div className="dash-card mb-4">
        <h3 className="mb-3 text-[14px] font-medium text-dl-forest">Recommendations</h3>

        {pkg.recommendations.length === 0 ? (
          <p className="text-[13px] text-dl-muted">No alternatives available for this package.</p>
        ) : (
          <div>
            {pkg.recommendations.map(rec => (
              <div
                key={rec.name}
                className="flex items-center justify-between border-b border-dl-border py-2.5 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <EcosystemIcon ecosystem={rec.ecosystem} />
                  <span className="text-[13px] font-medium text-dl-forest">{rec.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {rec.weeklyDownloads > 0 && (
                    <span className="text-[11px] text-dl-hint">
                      {formatNumber(rec.weeklyDownloads)}/wk
                    </span>
                  )}
                  <SPSBadge score={rec.sps} tier={spsToTier(rec.sps)} size="sm" />
                  <Link href={`/packages/${rec.name}`} className="text-[12px] text-dl-teal hover:underline">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dash-card mb-4">
        <h3 className="mb-3 text-[14px] font-medium text-dl-forest">Migration effort</h3>
        <div className="flex items-center justify-between border-b border-dl-border py-2 last:border-0">
          <span className="text-[13px] text-dl-muted">Lines impacted</span>
          <span className="text-[13px] font-medium text-dl-forest">
            {pkg.effortEstimate.linesImpacted.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-dl-border py-2 last:border-0">
          <span className="text-[13px] text-dl-muted">Files affected</span>
          <span className="text-[13px] font-medium text-dl-forest">
            {pkg.effortEstimate.filesAffected}
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-[13px] text-dl-muted">Sprint weeks</span>
          <span className="text-[13px] font-medium text-dl-forest">
            {pkg.effortEstimate.sprintWeeks > 0
              ? `${pkg.effortEstimate.sprintWeeks} week${pkg.effortEstimate.sprintWeeks !== 1 ? 's' : ''}`
              : 'Trivial'}
          </span>
        </div>
      </div>
    </>
  )
}
