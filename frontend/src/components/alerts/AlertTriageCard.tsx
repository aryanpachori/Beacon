import { Sparkles } from 'lucide-react'
import { AI_TRIAGE } from '@/lib/alertsData'

export function AlertTriageCard() {
  return (
    <div className="dash-card border border-dl-warning/25 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-dl-teal" aria-hidden />
        <h3 className="text-[13px] font-medium text-dl-forest">AI Triage</h3>
      </div>
      <p className="text-[12px] leading-relaxed text-dl-muted">{AI_TRIAGE.body}</p>
      <div className="mt-4 flex items-center justify-between gap-4 border-t border-dl-border pt-3">
        <span className="text-[13px] text-dl-muted">Packages with no sponsors</span>
        <span className="text-[13px] font-medium text-dl-critical tabular-nums">
          {AI_TRIAGE.sponsorFreeCount}
        </span>
      </div>
    </div>
  )
}
