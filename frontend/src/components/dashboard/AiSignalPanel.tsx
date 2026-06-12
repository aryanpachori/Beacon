'use client'

import { motion } from 'framer-motion'
import {
  HEATMAP_GRID,
  SPONSOR_NO_FUNDING_COUNT,
  SPONSOR_TOTAL_TRACKED,
  SPONSOR_LOST_RECENT,
  PREDICTED_RISK,
} from '@/lib/dashboardData'

/* Blue-scaled heatmap: 0=empty, 1=pale, 2=mid, 3=full */
const HEATMAP_COLORS = [
  'var(--dl-border)',
  'rgba(47,126,218,0.2)',
  'rgba(47,126,218,0.5)',
  'var(--dl-blue)',
]

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function AiSignalPanel() {
  const sponsorPct = (SPONSOR_NO_FUNDING_COUNT / SPONSOR_TOTAL_TRACKED) * 100

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.1 } },
      }}
    >
      {/* Maintainer activity heatmap */}
      <motion.div variants={cardVariants} className="dash-card">
        <div className="mb-3 flex items-center justify-between">
          <p className="dash-section-label">Maintainer Activity</p>
          <span className="rounded-full bg-dl-blue-pale px-2 py-0.5 text-[10px] font-semibold text-dl-blue">
            Live
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          {HEATMAP_GRID.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-0.5">
              {row.map((level, colIdx) => (
                <div
                  key={colIdx}
                  className="h-2.5 w-2.5 rounded-sm transition-colors duration-150"
                  style={{ backgroundColor: HEATMAP_COLORS[level] }}
                />
              ))}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-dl-muted">Across all monitored maintainers</p>
      </motion.div>

      {/* Sponsor health */}
      <motion.div variants={cardVariants} className="dash-card">
        <p className="dash-section-label mb-3">Sponsor Health</p>
        <div className="mb-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[12px] text-dl-text">No funding</span>
            <span className="text-[12px] font-semibold text-[#dc2626]">{Math.round(sponsorPct)}%</span>
          </div>
          <div className="progress-track">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#f97316] to-[#dc2626] transition-[width] duration-700"
              style={{ width: `${sponsorPct}%` }}
            />
          </div>
        </div>
        <p className="mb-3 text-[12px] text-dl-muted">
          {SPONSOR_NO_FUNDING_COUNT} packages have no sponsor funding
        </p>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-dl-muted">
          Lost sponsors recently
        </p>
        <ul className="space-y-1.5">
          {SPONSOR_LOST_RECENT.map(name => (
            <li key={name} className="flex items-center gap-2 text-[12px] text-dl-text">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#f97316]" />
              {name}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Predicted risk */}
      <motion.div variants={cardVariants} className="dash-card">
        <div className="mb-3 flex items-center justify-between">
          <p className="dash-section-label">Predicted Risk</p>
          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-500">
            AI
          </span>
        </div>
        <div className="space-y-4">
          {PREDICTED_RISK.map(({ name, days }) => {
            const urgency = days < 20 ? '#dc2626' : days < 45 ? '#ea580c' : '#ca8a04'
            const pct = ((90 - days) / 90) * 100
            return (
              <div key={name}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="text-[13px] font-medium text-dl-text">{name}</span>
                  <span className="text-[11px] font-semibold" style={{ color: urgency }}>
                    ~{days}d
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="h-full rounded-full transition-[width] duration-700"
                    style={{ width: `${pct}%`, background: urgency }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
