import { Sparkles } from 'lucide-react'
import type { Package } from '@/types'

interface AiVerdictCardProps {
  pkg: Package
}

function daysUntilCritical(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000))
}

export function AiVerdictCard({ pkg }: AiVerdictCardProps) {
  const body =
    pkg.predictionReason ??
    'Collecting more daily score history before a forecast is available.'
  const rSquared = pkg.predictionConfidence
  const daysToCritical = pkg.predictedCriticalAt
    ? daysUntilCritical(pkg.predictedCriticalAt)
    : null

  return (
    <div className="dash-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-dl-teal" aria-hidden />
        <h3 className="text-[13px] font-medium text-dl-forest">AI Assessment</h3>
      </div>
      <p className="text-[13px] leading-relaxed text-dl-forest">{body}</p>
      {daysToCritical !== null && (
        <p className="mt-2 text-[12px] font-medium text-dl-risk">
          → Critical in ~{daysToCritical} days
        </p>
      )}
      {rSquared != null && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[12px] text-dl-muted">Trend confidence (R²)</span>
            <span className="text-[13px] font-medium text-dl-teal">
              {Math.round(rSquared * 100)}%
            </span>
          </div>
          <div className="signal-bar-track">
            <div
              className="signal-bar-fill-high"
              style={{ width: `${Math.round(rSquared * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
