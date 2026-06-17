'use client'

import { useCallback, useEffect, useState } from 'react'
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react'
import type { AnalyticsData } from '@/lib/api'

interface Props {
  analytics: AnalyticsData
  critical: number
  atRisk: number
  watch: number
  healthy: number
  avgSps: number
}

export function AiStackInsightCard({ analytics, critical, atRisk, watch, healthy, avgSps }: Props) {
  const [insight, setInsight] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchInsight = useCallback(async function fetchInsight() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/stack-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalPackages: (critical + atRisk + watch + healthy),
          critical,
          atRisk,
          watch,
          healthy,
          avgSps,
          topDeclining: analytics.topDeclining,
          topImproving: analytics.topImproving,
          signalAverages: analytics.signalAverages,
        }),
      })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      setInsight(data.insight)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [critical, atRisk, watch, healthy, avgSps, analytics])

  useEffect(() => { fetchInsight() }, [fetchInsight])

  const borderColor = critical > 0
    ? 'border-red-500/20 bg-red-500/5'
    : atRisk > 0
      ? 'border-amber-500/20 bg-amber-500/5'
      : 'border-indigo-500/20 bg-indigo-500/5'

  return (
    <div className={`rounded-2xl border p-5 ${borderColor}`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-dl-navy">AI Stack Analysis</p>
            <p className="text-[10px] text-dl-muted">Powered by Gemini</p>
          </div>
        </div>
        {!loading && (
          <button
            onClick={fetchInsight}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-dl-muted transition-colors hover:bg-white/40 hover:text-dl-forest"
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
          <div className="skeleton h-3.5 w-11/12 rounded" />
          <div className="skeleton h-3.5 w-3/4 rounded" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-[12px] text-dl-muted">
          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
          AI analysis temporarily unavailable. Run a scan to generate insights.
        </div>
      ) : (
        <p className="text-[13px] leading-relaxed text-dl-navy">{insight}</p>
      )}
    </div>
  )
}
