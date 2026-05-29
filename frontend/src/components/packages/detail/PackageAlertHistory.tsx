import type { Package } from '@/types'
import { TierChip } from '@/components/ui/TierChip'
import { tierColor, spsToTier } from '@/lib/constants'
import { getPackageAlerts } from '@/lib/packageDetailData'
interface PackageAlertHistoryProps {
  pkg: Package
}

export function PackageAlertHistory({ pkg }: PackageAlertHistoryProps) {
  const rows = getPackageAlerts(pkg.id)

  return (
    <div className="dash-card p-5">
      <p className="dash-section-label mb-3">Alert history for this package</p>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-dl-muted">
          No alerts fired for this package yet.
        </p>
      ) : (
        <ul className="divide-y divide-dl-border">
          {rows.map(row => {
            const beforeTier = spsToTier(row.spsBefore)
            const afterTier = row.tier
            return (
              <li
                key={row.id}
                className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
              >
                <span className="w-full shrink-0 font-mono text-[11px] text-dl-hint sm:w-[100px]">
                  {row.date}
                </span>
                <span className="shrink-0 font-mono text-[12px] font-medium tabular-nums">
                  <span className={tierColor(beforeTier, 'text')}>{row.spsBefore}</span>
                  <span className="text-dl-muted"> → </span>
                  <span className={tierColor(afterTier, 'text')}>{row.spsAfter}</span>
                </span>
                <span className="min-w-0 flex-1 text-[12px] text-dl-muted">{row.reason}</span>
                <span className="shrink-0 self-start sm:self-center">
                  <TierChip tier={row.tier} />
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
