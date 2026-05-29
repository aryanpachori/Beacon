'use client'

import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { StackHealthRing } from '@/components/dashboard/StackHealthRing'
import {
  getHealthyPercentage,
  getHealthyRingColor,
  getStackAvgSpsTrend14,
  getAiSummaryStats,
  MONITORED_PACKAGE_COUNT,
  repos,
} from '@/lib/dashboardData'

export function HealthOverviewBar() {
  const healthyPct = getHealthyPercentage()
  const ringColor = getHealthyRingColor(healthyPct)
  const trendData = getStackAvgSpsTrend14()
  const { critical, crossedRisk } = getAiSummaryStats()
  const alertsThisWeek = 5

  return (
    <div className="dash-card mb-6 flex flex-col gap-4 p-5 lg:flex-row lg:items-stretch">
      <div className="flex shrink-0 items-center justify-center border-b border-dl-border px-4 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
        <StackHealthRing percentage={healthyPct} strokeColor={ringColor} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center border-b border-dl-border px-4 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
        <p className="dash-section-label mb-2">AI ASSESSMENT</p>
        <p className="text-[13px] leading-relaxed text-dl-forest">
          Your stack has{' '}
          <strong className="text-dl-cream">{critical} critical packages</strong> requiring
          immediate action. moment last saw a commit 195 days ago and has no active sponsors.{' '}
          <strong className="text-dl-cream">{crossedRisk} packages</strong> crossed the risk
          threshold this week.
        </p>
      </div>

      <div className="flex shrink-0 flex-col justify-center border-b border-dl-border px-4 pb-4 lg:w-[220px] lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
        <p className="dash-section-label mb-2">14-DAY TREND</p>
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
      </div>

      <div className="flex min-w-[160px] flex-col justify-center gap-3 px-2">
        {[
          { label: 'Packages monitored', value: String(MONITORED_PACKAGE_COUNT) },
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
