import { Sparkles } from 'lucide-react'
import type { Package } from '@/types'
import { getAiVerdict } from '@/lib/packageDetailData'

interface AiVerdictCardProps {
  pkg: Package
}

export function AiVerdictCard({ pkg }: AiVerdictCardProps) {
  const verdict = getAiVerdict(pkg)

  return (
    <div className="dash-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-dl-teal" aria-hidden />
        <h3 className="text-[13px] font-medium text-dl-forest">AI Assessment</h3>
      </div>
      <p className="text-[13px] leading-relaxed text-dl-forest">{verdict.body}</p>
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[12px] text-dl-muted">Prediction confidence</span>
          <span className="text-[13px] font-medium text-dl-teal">{verdict.confidence}%</span>
        </div>
        <div className="signal-bar-track">
          <div
            className="signal-bar-fill-high"
            style={{ width: `${verdict.confidence}%` }}
          />
        </div>
      </div>
    </div>
  )
}
