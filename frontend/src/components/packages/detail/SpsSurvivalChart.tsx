'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceArea,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Label,
} from 'recharts'
import type { Package } from '@/types'
import { tierColor } from '@/lib/constants'
import { buildChartSeries } from '@/lib/packageDetailData'

const chartStyle = {
  gridStroke: 'rgba(246,238,220,0.08)',
  axisTickColor: '#AB9F86',
  tooltipBg: '#29241A',
  tooltipBorder: 'rgba(163,188,140,0.25)',
  tooltipText: '#EEE5D2',
}

const X_TICKS = [0, 30, 60, 89, 120, 150, 179]

interface SpsSurvivalChartProps {
  pkg: Package
}

export function SpsSurvivalChart({ pkg }: SpsSurvivalChartProps) {
  const chartData = buildChartSeries(pkg)

  const tickLabel = (dayIndex: number) =>
    chartData.find(d => d.dayIndex === dayIndex)?.date ?? ''

  return (
    <div className="dash-card relative p-5" style={{ border: 'none', background: 'var(--dl-surface)' }}>
      <p className="dash-section-label mb-4">90-day SPS survival curve</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.gridStroke} />
          <XAxis
            dataKey="dayIndex"
            type="number"
            domain={[0, 179]}
            ticks={X_TICKS}
            tick={{ fontSize: 10, fill: chartStyle.axisTickColor }}
            tickLine={false}
            axisLine={false}
            tickFormatter={tickLabel}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: chartStyle.axisTickColor }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              background: chartStyle.tooltipBg,
              border: `1px solid ${chartStyle.tooltipBorder}`,
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: chartStyle.axisTickColor }}
            itemStyle={{ color: chartStyle.tooltipText }}
            formatter={(value: number) => [`${value}`, 'SPS']}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.date ? String(payload[0].payload.date) : ''
            }
          />
          <ReferenceArea x1={89} x2={179} fill="rgba(228,82,82,0.05)" strokeOpacity={0}>
            <Label
              value="Prediction window"
              position="insideTopRight"
              fill="var(--dl-critical)"
              fontSize={10}
              offset={8}
            />
          </ReferenceArea>
          <ReferenceLine
            x={89}
            stroke="var(--dl-sage)"
            strokeDasharray="4 4"
            strokeOpacity={0.7}
          >
            <Label value="Today" position="top" fill="var(--dl-sage)" fontSize={10} />
          </ReferenceLine>
          <ReferenceLine
            y={20}
            stroke="var(--dl-critical)"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <ReferenceLine
            y={50}
            stroke="var(--dl-sage)"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <Line
            type="monotone"
            dataKey="sps"
            stroke={tierColor(pkg.tier, 'stroke')}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls
            isAnimationActive
            animationDuration={1400}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
