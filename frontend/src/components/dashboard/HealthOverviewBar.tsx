'use client'

import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { StackHealthRing } from '@/components/dashboard/StackHealthRing'
import { getHealthyRingColor } from '@/lib/dashboardData'
import { useAppData } from '@/context/AppDataContext'

export function HealthOverviewBar() {
  const { dashboard, packages, repos, alerts } = useAppData()

  const scoredPackages = packages.filter(p => !p.scoringPending)
  const healthyPct =
    scoredPackages.length > 0
      ? Math.round(
          (scoredPackages.filter(p => p.tier === 'healthy').length / scoredPackages.length) * 100
        )
      : packages.length > 0
        ? 0
        : 100

  const ringColor = getHealthyRingColor(healthyPct)
  const critical = dashboard?.healthCounts.critical ?? 0
  const atRisk = dashboard?.healthCounts.atRisk ?? 0
  const totalPackages = dashboard?.totalPackages ?? packages.length
  const scanned = dashboard?.scanProgress?.scanned ?? totalPackages
  const scoringPending = packages.some(p => p.scoringPending)

  const weekAgo = Date.now() - 7 * 86_400_000
  const alertsThisWeek = alerts.filter(a => new Date(a.firedAt).getTime() >= weekAgo).length

  const trendData =
    dashboard && dashboard.avgSps > 0
      ? Array.from({ length: 14 }, (_, i) => ({
          day: i,
          avg: dashboard.avgSps + (i - 7) * 0.5,
        }))
      : [{ day: 0, avg: 0 }]

  const assessmentCopy = scoringPending
    ? `${scanned} of ${totalPackages} packages scanned. Signals are in — intelligence scoring will populate SPS and tiers shortly.`
    : critical + atRisk > 0
      ? `Your stack has ${critical} critical and ${atRisk} at-risk packages. Review the feed below for packages needing attention.`
      : totalPackages > 0
        ? `${totalPackages} packages monitored across ${repos.length} repos. Stack health looks stable.`
        : 'Connect GitHub to start monitoring your dependency health.'

  return (
    <div className="dash-card mb-6 flex flex-col gap-4 p-5 lg:flex-row lg:items-stretch">
      <div className="flex shrink-0 items-center justify-center border-b border-dl-border px-4 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
        <StackHealthRing percentage={healthyPct} strokeColor={ringColor} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center border-b border-dl-border px-4 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
        <p className="dash-section-label mb-2">STACK STATUS</p>
        <p className="text-[13px] leading-relaxed text-dl-forest">{assessmentCopy}</p>
      </div>

      <div className="flex shrink-0 flex-col justify-center border-b border-dl-border px-4 pb-4 lg:w-[220px] lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
        <p className="dash-section-label mb-2">14-DAY TREND</p>
        {dashboard && dashboard.avgSps > 0 ? (
          <ResponsiveContainer width="100%" height={60}>
            <AreaChart data={trendData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--dl-teal)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="var(--dl-teal)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="avg"
                stroke="var(--dl-teal)"
                strokeWidth={2}
                fill="url(#trendFill)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-[12px] text-dl-muted">Trend available after scoring</p>
        )}
      </div>

      <div className="flex min-w-[160px] flex-col justify-center gap-3 px-2">
        {[
          { label: 'Packages monitored', value: String(totalPackages) },
          { label: 'Repos connected', value: String(repos.length) },
          { label: 'Alerts this week', value: String(alertsThisWeek) },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-baseline justify-between gap-3">
            <span className="text-[11px] text-dl-muted">{label}</span>
            <span className="text-[14px] font-medium text-dl-forest">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
