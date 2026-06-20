'use client'

import type { Package } from '@/types'
import { EcosystemIcon } from '@/components/ui/EcosystemIcon'
import { SPSBadge } from '@/components/ui/SPSBadge'
import { spsToTier } from '@/lib/constants'
import {
  getReplacementBlurb,
  getMigrationNote,
  getRecommendationNpmUrl,
  formatWeeklyDownloads,
} from '@/lib/packageDetailData'
import { Copy, CheckCircle } from 'lucide-react'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

interface PackageMigrationPanelProps {
  pkg: Package
}

function InstallCopyRow({ packageName }: { packageName: string }) {
  const { copy, copied } = useCopyToClipboard()
  const cmd = `npm install ${packageName}`
  return (
    <div className="mt-2 flex items-center gap-2 rounded-md bg-dl-surface px-2.5 py-1.5 font-mono text-[11px] text-dl-forest">
      <span className="flex-1">{cmd}</span>
      <button
        onClick={() => copy(cmd)}
        title="Copy install command"
        className="shrink-0 text-dl-hint hover:text-dl-teal transition-colors"
      >
        {copied ? <CheckCircle className="h-3.5 w-3.5 text-dl-teal" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}

export function PackageMigrationPanel({ pkg }: PackageMigrationPanelProps) {
  const recommendations = pkg.recommendations.slice(0, 3)

  return (
    <div className="flex flex-col gap-4">
      <div className="dash-card p-5">
        <p className="dash-section-label mb-4">Suggested replacements</p>
        {recommendations.length === 0 ? (
          <p className="text-[13px] text-dl-muted">No alternatives available for this package.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {recommendations.map(rec => {
              const npmUrl = getRecommendationNpmUrl(rec)
              return (
                <div key={rec.name} className="border-b border-dl-border pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-medium text-dl-forest">{rec.name}</span>
                    <SPSBadge score={rec.sps} tier={spsToTier(rec.sps)} size="sm" />
                    <span
                      className="inline-flex shrink-0 items-center rounded-full border border-dl-teal/20 bg-dl-teal/10 px-2 py-0.5"
                      title={rec.ecosystem}
                    >
                      <EcosystemIcon
                        ecosystem={rec.ecosystem}
                        className="h-3.5 min-w-3.5 border-0 bg-transparent p-0 text-[8px]"
                      />
                    </span>
                  </div>
                  <p className="mt-1.5 text-[12px] text-dl-muted">{getReplacementBlurb(rec.name)}</p>
                  {rec.ecosystem === 'npm' && <InstallCopyRow packageName={rec.name} />}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-dl-hint">
                      {formatWeeklyDownloads(rec.weeklyDownloads)} weekly downloads
                    </span>
                    {npmUrl && (
                      <a
                        href={npmUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] font-medium text-dl-teal hover:underline"
                      >
                        View →
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="dash-card p-5">
        <p className="dash-section-label mb-4">Migration effort</p>
        <div className="space-y-2 border-b border-dl-border pb-3">
          <div className="flex justify-between">
            <span className="text-[13px] text-dl-muted">Lines impacted</span>
            <span className="text-[13px] font-medium text-dl-forest">
              {pkg.effortEstimate.linesImpacted.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[13px] text-dl-muted">Files affected</span>
            <span className="text-[13px] font-medium text-dl-forest">
              {pkg.effortEstimate.filesAffected}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[13px] text-dl-muted">Suggested sprint</span>
            <span className="text-[13px] font-medium text-dl-forest">
              {pkg.effortEstimate.sprintWeeks > 0
                ? `${pkg.effortEstimate.sprintWeeks} week${pkg.effortEstimate.sprintWeeks !== 1 ? 's' : ''}`
                : 'Trivial'}
            </span>
          </div>
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-dl-muted">{getMigrationNote(pkg)}</p>
      </div>
    </div>
  )
}
