'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, ReferenceLine,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { packages, alerts } from '@/lib/mockData'
import { EcosystemIcon } from '@/components/ui/EcosystemIcon'
import { SPSBadge } from '@/components/ui/SPSBadge'
import { TierChip } from '@/components/ui/TierChip'
import { SignalCard } from '@/components/packages/SignalCard'
import { MigrationCard } from '@/components/packages/MigrationCard'
import { AlertCard } from '@/components/alerts/AlertCard'
import { timeAgo } from '@/lib/utils'

interface PageProps {
  params: { id: string }
}

export default function PackageDetailPage({ params }: PageProps) {
  const pkg = packages.find(p => p.id === params.id)
  if (!pkg) notFound()

  const pkgAlerts = alerts.filter(a => a.packageId === pkg.id).slice(0, 3)

  const chartData = pkg.spsHistory.map((v, i) => {
    const daysAgo = 89 - i
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sps: v,
    }
  })

  const signalEntries = Object.entries(pkg.signals) as [
    keyof typeof pkg.signals,
    (typeof pkg.signals)[keyof typeof pkg.signals]
  ][]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back */}
      <Link
        href="/packages"
        className="inline-flex items-center gap-1.5 text-sm text-dash-muted hover:text-dash-text mb-5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All packages
      </Link>

      <div className="grid grid-cols-5 gap-6">
        {/* Left column — 60% */}
        <div className="col-span-3 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <EcosystemIcon ecosystem={pkg.ecosystem} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-dash-text">{pkg.name}</h1>
                <TierChip tier={pkg.tier} />
              </div>
              <p className="text-sm text-dash-muted font-mono">v{pkg.version} · {pkg.repoName}</p>
            </div>
            <div className="ml-auto">
              <SPSBadge sps={pkg.sps} size="lg" />
            </div>
          </div>

          {/* SPS History Chart */}
          <div className="rounded-lg border border-dash-border bg-dash-surface p-4">
            <p className="text-xs text-dash-muted mb-3 uppercase tracking-wide">90-day SPS history</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'var(--dl-muted)' }}
                  tickLine={false}
                  axisLine={false}
                  interval={14}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: 'var(--dl-muted)' }}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--dl-surface)',
                    border: '1px solid var(--dl-border)',
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: 'var(--dl-muted)' }}
                  itemStyle={{ color: 'var(--dl-text)' }}
                />
                <ReferenceLine y={20} stroke="var(--dl-critical)" strokeDasharray="4 4" strokeOpacity={0.5} />
                <ReferenceLine y={50} stroke="var(--dl-watch)"    strokeDasharray="4 4" strokeOpacity={0.5} />
                <Line
                  type="monotone"
                  dataKey="sps"
                  stroke={`var(--dl-${pkg.tier === 'at-risk' ? 'risk' : pkg.tier})`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Signals grid */}
          <div>
            <p className="text-xs text-dash-muted mb-3 uppercase tracking-wide">Signals</p>
            <div className="grid grid-cols-2 gap-3">
              {signalEntries.map(([key, signal]) => (
                <SignalCard key={key} signalKey={key} signal={signal} />
              ))}
            </div>
          </div>
        </div>

        {/* Right column — 40% */}
        <div className="col-span-2 flex flex-col gap-5">
          <MigrationCard pkg={pkg} />

          {/* Recent alerts */}
          {pkgAlerts.length > 0 && (
            <div>
              <p className="text-xs text-dash-muted mb-3 uppercase tracking-wide">Recent alerts</p>
              <div className="flex flex-col gap-2">
                {pkgAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} compact />
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="rounded-lg border border-dash-border bg-dash-surface p-4">
            <p className="text-xs text-dash-muted mb-2 uppercase tracking-wide">Details</p>
            <dl className="text-xs space-y-1.5">
              <div className="flex justify-between">
                <dt className="text-dash-muted">Ecosystem</dt>
                <dd className="text-dash-text uppercase">{pkg.ecosystem}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-dash-muted">Last updated</dt>
                <dd className="text-dash-text">{timeAgo(pkg.lastUpdated)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-dash-muted">Monitored repo</dt>
                <dd className="text-dash-text font-mono">{pkg.repoName}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
