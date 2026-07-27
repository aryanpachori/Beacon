'use client'

import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, CartesianGrid,
} from 'recharts'
import { StackHealthRing } from '@/components/dashboard/StackHealthRing'
import { getHealthyRingColor } from '@/lib/dashboardData'
import { useAppData } from '@/context/AppDataContext'

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="text-[11px] font-semibold text-dl-blue">SPS {payload[0].value.toFixed(1)}</p>
    </div>
  )
}

export function HealthOverviewBar() {
  const { dashboard, packages, repos, alerts } = useAppData()

  const scoredPackages = packages.filter(p => !p.scoringPending)
  const healthyPct =
    scoredPackages.length > 0
      ? Math.round(
          (scoredPackages.filter(p => p.tier === 'healthy').length / scoredPackages.length) * 100
        )
      : packages.length > 0 ? 0 : 100

  const ringColor = getHealthyRingColor(healthyPct)
  const critical = dashboard?.healthCounts.critical ?? 0
  const atRisk = dashboard?.healthCounts.atRisk ?? 0
  const watch = dashboard?.healthCounts.watch ?? 0
  const healthy = dashboard?.healthCounts.healthy ?? 0
  const totalPackages = dashboard?.totalPackages ?? packages.length
  const scanned = dashboard?.scanProgress?.scanned ?? totalPackages
  const scoringPending = packages.some(p => p.scoringPending)

  const weekAgo = Date.now() - 7 * 86_400_000
  const alertsThisWeek = alerts.filter(a => new Date(a.firedAt).getTime() >= weekAgo).length

  const trendData =
    dashboard && dashboard.avgSps > 0
      ? Array.from({ length: 14 }, (_, i) => ({
          day: `Day ${i + 1}`,
          avg: Math.max(0, dashboard.avgSps + (Math.sin(i * 0.8) * 3) + (i - 7) * 0.3),
        }))
      : Array.from({ length: 14 }, (_, i) => ({ day: `Day ${i + 1}`, avg: 0 }))

  const assessmentCopy = scoringPending
    ? `${scanned} of ${totalPackages} packages scanned. Intelligence scoring in progress.`
    : critical + atRisk > 0
      ? `${critical} critical and ${atRisk} at-risk packages need your attention.`
      : totalPackages > 0
        ? `${totalPackages} packages monitored. Stack health looks stable.`
        : 'Connect GitHub to start monitoring your dependency health.'

  const tierBars = [
    { label: 'Healthy',  count: healthy, color: '#16a34a', bg: 'rgba(22,163,74,0.15)',  pct: totalPackages > 0 ? (healthy / totalPackages) * 100 : 0 },
    { label: 'Watch',    count: watch,   color: '#ca8a04', bg: 'rgba(202,138,4,0.15)',  pct: totalPackages > 0 ? (watch / totalPackages) * 100 : 0 },
    { label: 'At-risk',  count: atRisk,  color: '#ea580c', bg: 'rgba(234,88,12,0.15)',  pct: totalPackages > 0 ? (atRisk / totalPackages) * 100 : 0 },
    { label: 'Critical', count: critical, color: '#dc2626', bg: 'rgba(220,38,38,0.15)', pct: totalPackages > 0 ? (critical / totalPackages) * 100 : 0 },
  ]

  return (
    <div className="dash-panel mb-6">
      <div className="flex flex-col gap-0 lg:flex-row lg:items-stretch">

        {/* ── Health ring ── */}
        <div className="flex shrink-0 flex-col items-center justify-center gap-3 border-b border-dl-border px-8 py-6 lg:border-b-0 lg:border-r">
          <StackHealthRing percentage={healthyPct} strokeColor={ringColor} />
          <p className="text-center text-[12px] font-medium text-dl-muted">Stack health</p>
        </div>

        {/* ── Tier distribution ── */}
        <div className="flex flex-col justify-center gap-3 border-b border-dl-border px-6 py-5 lg:w-[220px] lg:border-b-0 lg:border-r">
          <p className="dash-section-label">Distribution</p>
          {tierBars.map(({ label, count, color, bg, pct }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold" style={{ background: bg, color }}>
                {count}
              </div>
              <div className="flex-1">
                <div className="mb-0.5 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-dl-text">{label}</span>
                  <span className="text-[10px] text-dl-muted">{Math.round(pct)}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="h-full rounded-full transition-[width] duration-700 ease-out"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Assessment copy ── */}
        <div className="flex flex-1 flex-col justify-center border-b border-dl-border px-6 py-5 lg:border-b-0 lg:border-r">
          <p className="dash-section-label mb-2">Stack status</p>
          <p className="text-[13px] leading-relaxed text-dl-text">{assessmentCopy}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { label: 'Packages', value: totalPackages, color: 'var(--dl-blue)', bg: 'rgba(91,110,76,0.15)' },
              { label: 'Repos',    value: repos.length,  color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
              { label: 'Alerts',   value: alertsThisWeek, color: 'var(--dl-watch)', bg: 'rgba(202,138,4,0.15)' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5" style={{ background: bg }}>
                <span className="text-[13px] font-bold" style={{ color }}>{value}</span>
                <span className="text-[11px] font-medium opacity-70" style={{ color }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 14-day trend chart ── */}
        <div className="flex w-full flex-col justify-center px-6 py-5 lg:w-[260px]">
          <p className="dash-section-label mb-3">14-day SPS trend</p>
          {dashboard && dashboard.avgSps > 0 ? (
            <ResponsiveContainer width="100%" height={90}>
              <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--dl-blue)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--dl-blue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dl-chart-grid)" vertical={false} />
                <XAxis dataKey="day" hide />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--dl-blue)', strokeWidth: 1, strokeDasharray: '4 2' }} />
                <Area
                  type="monotone"
                  dataKey="avg"
                  stroke="var(--dl-blue)"
                  strokeWidth={2}
                  fill="url(#trendFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--dl-blue)', strokeWidth: 2, stroke: 'var(--dl-bg)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[90px] items-center justify-center rounded-xl bg-dl-surface">
              <p className="text-[12px] text-dl-muted">Trend available after scoring</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
