'use client'

import { motion } from 'framer-motion'
import {
  HEATMAP_GRID,
  SPONSOR_NO_FUNDING_COUNT,
  SPONSOR_TOTAL_TRACKED,
  SPONSOR_LOST_RECENT,
  PREDICTED_RISK,
} from '@/lib/dashboardData'

const HEATMAP_COLORS = [
  'rgba(255,255,255,0.04)',
  'rgba(53,133,142,0.2)',
  'rgba(53,133,142,0.5)',
  'var(--dl-teal)',
]

const cardVariants = {
  hidden: { opacity: 0, x: 16 },
  show: { opacity: 1, x: 0 },
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
      <motion.div variants={cardVariants} className="dash-card">
        <p className="dash-section-label mb-3">MAINTAINER ACTIVITY</p>
        <div className="flex flex-col gap-0.5">
          {HEATMAP_GRID.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-0.5">
              {row.map((level, colIdx) => (
                <div
                  key={colIdx}
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: HEATMAP_COLORS[level] }}
                />
              ))}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-dl-hint">Across all monitored maintainers</p>
      </motion.div>

      <motion.div variants={cardVariants} className="dash-card">
        <p className="dash-section-label mb-3">SPONSOR HEALTH</p>
        <div className="sponsor-bar-track mb-2">
          <div
            className="sponsor-bar-fill"
            style={{ width: `${sponsorPct}%` }}
          />
        </div>
        <p className="mb-3 text-[12px] text-dl-muted">
          {SPONSOR_NO_FUNDING_COUNT} packages have no sponsor funding
        </p>
        <p className="mb-2 text-[12px] text-dl-muted">
          3 packages lost sponsors in the last 90 days
        </p>
        <ul className="space-y-1">
          {SPONSOR_LOST_RECENT.map(name => (
            <li key={name} className="flex items-center gap-2 text-[12px] text-dl-forest">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-dl-warning" />
              {name}
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div variants={cardVariants} className="dash-card">
        <p className="dash-section-label mb-3">PREDICTED RISK</p>
        <div className="space-y-4">
          {PREDICTED_RISK.map(({ name, days }) => (
            <div key={name}>
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="text-[13px] text-dl-forest">{name}</span>
                <span className="text-[12px] text-dl-risk">→ Critical in ~{days} days</span>
              </div>
              <div className="signal-bar-track">
                <div
                  className="signal-bar-fill-mid"
                  style={{ width: `${((90 - days) / 90) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
