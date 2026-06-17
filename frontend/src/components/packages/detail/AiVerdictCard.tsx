'use client'

import { useCallback, useEffect, useState } from 'react'
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react'
import type { Package } from '@/types'

interface AiVerdictCardProps {
  pkg: Package
}

function daysUntilCritical(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000))
}

export function AiVerdictCard({ pkg }: AiVerdictCardProps) {
  const [insight, setInsight] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchInsight = useCallback(async function fetchInsight() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/package-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pkg.name,
          ecosystem: pkg.ecosystem,
          sps: pkg.sps,
          tier: pkg.tier,
          signals: pkg.signals,
          facts: pkg.signalFacts,
        }),
      })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      setInsight(data.insight)
    } catch {
      setError(true)
      // Fallback to static predictionReason if Gemini fails
      if (pkg.predictionReason) setInsight(pkg.predictionReason)
    } finally {
      setLoading(false)
    }
  }, [pkg.id, pkg.name, pkg.ecosystem, pkg.sps, pkg.tier, pkg.signals, pkg.signalFacts, pkg.predictionReason])

  useEffect(() => { fetchInsight() }, [fetchInsight])

  const rSquared = pkg.predictionConfidence
  const daysToCritical = pkg.predictedCriticalAt
    ? daysUntilCritical(pkg.predictedCriticalAt)
    : null

  return (
    <div className="dash-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-dl-teal" aria-hidden />
          <h3 className="text-[13px] font-medium text-dl-forest">AI Assessment</h3>
          <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-500">
            Gemini
          </span>
        </div>
        {!loading && (
          <button
            onClick={fetchInsight}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-dl-muted transition-colors hover:bg-dl-surface hover:text-dl-forest"
            title="Refresh AI insight"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="skeleton h-3.5 w-full rounded" />
          <div className="skeleton h-3.5 w-5/6 rounded" />
          <div className="skeleton h-3.5 w-4/6 rounded" />
        </div>
      ) : error && !insight ? (
        <div className="flex items-center gap-2 text-[12px] text-dl-muted">
          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
          AI insight temporarily unavailable. Collecting score history for forecast.
        </div>
      ) : (
        <p className="text-[13px] leading-relaxed text-dl-forest">{insight}</p>
      )}

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
