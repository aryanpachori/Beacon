'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lock, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SparklineBars } from '@/components/marketing/SparklineBars'
import { MarketingTierChip } from '@/components/marketing/MarketingTierChip'
import { inViewOptions } from '@/components/marketing/motion'

const textStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const textItem = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease: 'easeOut' } },
}

const MOCK_PACKAGES = [
  {
    abbr: 'mo',
    name: 'moment',
    version: '2.29.4',
    tier: 'critical' as const,
    sps: 11,
    trend: 'declining' as const,
    signals: [
      { label: 'Commits', value: 5 },
      { label: 'Maintainer', value: 8 },
      { label: 'Funding', value: 2 },
      { label: 'Issues', value: 15 },
      { label: 'Security', value: 22 },
    ],
  },
  {
    abbr: 'rq',
    name: 'request',
    version: '2.88.2',
    tier: 'at-risk' as const,
    sps: 32,
    trend: 'declining' as const,
    signals: [
      { label: 'Commits', value: 18 },
      { label: 'Maintainer', value: 25 },
      { label: 'Funding', value: 10 },
      { label: 'Issues', value: 40 },
      { label: 'Security', value: 45 },
    ],
  },
  {
    abbr: 'ld',
    name: 'lodash',
    version: '4.17.21',
    tier: 'healthy' as const,
    sps: 84,
    trend: 'rising' as const,
    signals: [
      { label: 'Commits', value: 75 },
      { label: 'Maintainer', value: 80 },
      { label: 'Funding', value: 70 },
      { label: 'Issues', value: 88 },
      { label: 'Security', value: 92 },
    ],
  },
]

const SPS_COLOR: Record<string, string> = {
  critical: 'text-dl-critical',
  'at-risk': 'text-dl-risk',
  watch: 'text-dl-watch',
  healthy: 'text-dl-healthy',
}

const SPARK_COLOR: Record<string, string> = {
  critical: 'var(--dl-critical)',
  'at-risk': 'var(--dl-risk)',
  watch: 'var(--dl-watch)',
  healthy: 'var(--dl-healthy)',
}

const SIGNAL_BG: Record<string, string> = {
  critical: 'bg-dl-critical',
  'at-risk': 'bg-dl-risk',
  watch: 'bg-dl-watch',
  healthy: 'bg-dl-teal',
}

function PackageRow({
  abbr,
  name,
  version,
  tier,
  sps,
  trend,
  signals,
  isExpanded,
  onToggle,
}: (typeof MOCK_PACKAGES)[0] & { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div>
      <div
        className="flex items-center gap-3 border-t border-white/10 py-3 first:border-t-0 first:pt-0 cursor-pointer transition-colors hover:bg-white/[0.03] rounded-lg px-2 -mx-2"
        onClick={onToggle}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 font-mono text-[11px] font-medium text-white/80">
          {abbr}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{name}</p>
          <p className="text-xs text-white/60">{version}</p>
        </div>
        <SparklineBars trend={trend} color={SPARK_COLOR[tier]} />
        <span className={`w-8 text-right font-mono text-sm font-medium ${SPS_COLOR[tier]}`}>{sps}</span>
        <MarketingTierChip tier={tier} />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="ml-12 mr-2 mb-2 rounded-lg bg-white/[0.04] p-3">
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/50">
                Signal Breakdown
              </p>
              <div className="flex flex-col gap-2">
                {signals.map((signal) => (
                  <div key={signal.label} className="flex items-center gap-2">
                    <span className="w-[60px] text-right text-[10px] text-white/60">
                      {signal.label}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${SIGNAL_BG[tier]}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${signal.value}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="w-[20px] text-right font-mono text-[10px] text-white/60">
                      {signal.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Hero() {
  const [expandedPkg, setExpandedPkg] = useState<string>('moment')

  return (
    <section className="section-dark relative min-h-[680px] overflow-hidden lg:min-h-screen">
      {/* Animated mesh gradient background */}
      <div className="hero-mesh-gradient pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto grid max-w-[1200px] gap-12 px-6 pb-[100px] pt-[120px] lg:grid-cols-[55%_45%] lg:items-center">
        <motion.div
          variants={textStagger}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOptions}
        >
          <motion.p variants={textItem} className="label-overline border-l border-white/40 pl-3 text-white/80">
            Predictive dependency intelligence
          </motion.p>
          <motion.h1
            variants={textItem}
            className="mt-6 text-hero-mobile text-white lg:text-hero"
          >
            Know which packages are dying — 60 days before they do.
          </motion.h1>
          <motion.p
            variants={textItem}
            className="mt-5 max-w-[480px] text-base text-white/85"
          >
            Beacon monitors every open source dependency in your codebase and predicts abandonment
            before it becomes a production incident. Stop firefighting. Start planning.
          </motion.p>
          <motion.div variants={textItem} className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary">
              Start free — no card needed
            </Link>
            <a href="#how-it-works" className="btn-ghost">
              See how it works →
            </a>
          </motion.div>
          <motion.div variants={textItem} className="mt-6 flex flex-wrap gap-5 text-xs text-white/65">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-dl-healthy" />
              SOC 2 in progress
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              Read-only GitHub access
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              No code ever stored
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
          viewport={inViewOptions}
          className="rounded-2xl border border-white/15 bg-white/5 p-5 shadow-[0_0_60px_rgba(53,133,142,0.15)] backdrop-blur-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-white">Dependency health</span>
          </div>
          {MOCK_PACKAGES.map((pkg) => (
            <PackageRow
              key={pkg.name}
              {...pkg}
              isExpanded={expandedPkg === pkg.name}
              onToggle={() => setExpandedPkg(expandedPkg === pkg.name ? '' : pkg.name)}
            />
          ))}
          <p className="mt-3 text-center text-[10px] text-white/45">Click a row to see signal breakdown</p>
        </motion.div>
      </div>
    </section>
  )
}
