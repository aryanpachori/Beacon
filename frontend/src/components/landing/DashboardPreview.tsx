'use client'

import { motion } from 'framer-motion'
import { SparklineBars } from '@/components/marketing/SparklineBars'
import { MarketingTierChip, type MarketingTier } from '@/components/marketing/MarketingTierChip'
import { inViewOptions, sectionReveal } from '@/components/marketing/motion'

type Row = {
  name: string
  ecosystem: string
  trend: 'declining' | 'flat' | 'rising'
  sps: number
  tier: MarketingTier
}

const ROWS: Row[] = [
  { name: 'moment', ecosystem: 'npm', trend: 'declining', sps: 11, tier: 'critical' },
  { name: 'request', ecosystem: 'npm', trend: 'declining', sps: 17, tier: 'critical' },
  { name: 'node-sass', ecosystem: 'npm', trend: 'declining', sps: 32, tier: 'at-risk' },
  { name: 'rxjs', ecosystem: 'npm', trend: 'declining', sps: 38, tier: 'at-risk' },
  { name: 'express', ecosystem: 'npm', trend: 'flat', sps: 67, tier: 'watch' },
  { name: 'lodash', ecosystem: 'npm', trend: 'rising', sps: 84, tier: 'healthy' },
]

const SPS_COLOR: Record<MarketingTier, string> = {
  critical: 'text-dl-critical',
  'at-risk': 'text-dl-risk',
  watch: 'text-dl-watch',
  healthy: 'text-dl-healthy',
}

const SPARK_COLOR: Record<MarketingTier, string> = {
  critical: 'var(--dl-critical)',
  'at-risk': 'var(--dl-risk)',
  watch: 'var(--dl-watch)',
  healthy: 'var(--dl-healthy)',
}

export function DashboardPreview() {
  return (
    <section className="section-dark px-6 py-[100px]">
      <motion.div
        className="mx-auto max-w-[1200px] text-center"
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
        variants={sectionReveal}
      >
        <p className="label-overline text-dl-sage">Your command center</p>
        <h2 className="mt-4 text-section-mobile font-medium text-dl-cream lg:text-section">
          See every risk, ranked and ready to act on.
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-[15px] text-dl-sage-light/65">
          A single view of every dependency in your stack — sorted by survival probability, with
          migration paths surfaced automatically.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          viewport={inViewOptions}
          className="mx-auto mt-12 w-full max-w-[860px] rounded-2xl border border-dl-sage-light/10 bg-white/5 p-6 shadow-[0_0_80px_rgba(53,133,142,0.12)]"
        >
          <motion.div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium text-dl-cream">Dependency dashboard</span>
            <span className="text-xs text-dl-sage-light/50">Sample view</span>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-dl-sage-light/10 text-[11px] uppercase tracking-wide text-dl-sage-light/40">
                  <th className="pb-3 font-medium">Package</th>
                  <th className="pb-3 font-medium">Ecosystem</th>
                  <th className="pb-3 font-medium">Trend</th>
                  <th className="pb-3 font-medium">SPS</th>
                  <th className="pb-3 font-medium">Tier</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr
                    key={row.name}
                    className="border-b border-dl-sage-light/5 transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="py-3 font-medium text-dl-cream">{row.name}</td>
                    <td className="py-3 text-dl-sage-light/60">{row.ecosystem}</td>
                    <td className="py-3">
                      <SparklineBars trend={row.trend} color={SPARK_COLOR[row.tier]} />
                    </td>
                    <td className={`py-3 font-mono font-medium ${SPS_COLOR[row.tier]}`}>{row.sps}</td>
                    <td className="py-3">
                      <MarketingTierChip tier={row.tier} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
