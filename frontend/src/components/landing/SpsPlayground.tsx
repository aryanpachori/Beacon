'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowRight } from 'lucide-react'
import { inViewOptions, sectionReveal, staggerContainer } from '@/components/marketing/motion'
import { MarketingTierChip, type MarketingTier } from '@/components/marketing/MarketingTierChip'

interface PackageResult {
  name: string
  sps: number
  tier: MarketingTier
  signals: { label: string; value: number }[]
  migration?: string
}

const MOCK_DB: Record<string, PackageResult> = {
  moment: {
    name: 'moment',
    sps: 11,
    tier: 'critical',
    signals: [
      { label: 'Commits', value: 5 },
      { label: 'Maintainer', value: 8 },
      { label: 'Funding', value: 2 },
      { label: 'Issues', value: 15 },
      { label: 'Security', value: 22 },
    ],
    migration: 'date-fns or dayjs',
  },
  request: {
    name: 'request',
    sps: 17,
    tier: 'critical',
    signals: [
      { label: 'Commits', value: 3 },
      { label: 'Maintainer', value: 5 },
      { label: 'Funding', value: 0 },
      { label: 'Issues', value: 12 },
      { label: 'Security', value: 20 },
    ],
    migration: 'undici or node-fetch',
  },
  'node-sass': {
    name: 'node-sass',
    sps: 32,
    tier: 'at-risk',
    signals: [
      { label: 'Commits', value: 18 },
      { label: 'Maintainer', value: 25 },
      { label: 'Funding', value: 10 },
      { label: 'Issues', value: 40 },
      { label: 'Security', value: 45 },
    ],
    migration: 'sass (Dart Sass)',
  },
  lodash: {
    name: 'lodash',
    sps: 84,
    tier: 'healthy',
    signals: [
      { label: 'Commits', value: 75 },
      { label: 'Maintainer', value: 80 },
      { label: 'Funding', value: 70 },
      { label: 'Issues', value: 88 },
      { label: 'Security', value: 92 },
    ],
  },
  express: {
    name: 'express',
    sps: 67,
    tier: 'watch',
    signals: [
      { label: 'Commits', value: 55 },
      { label: 'Maintainer', value: 60 },
      { label: 'Funding', value: 50 },
      { label: 'Issues', value: 72 },
      { label: 'Security', value: 80 },
    ],
  },
  react: {
    name: 'react',
    sps: 96,
    tier: 'healthy',
    signals: [
      { label: 'Commits', value: 95 },
      { label: 'Maintainer', value: 98 },
      { label: 'Funding', value: 92 },
      { label: 'Issues', value: 94 },
      { label: 'Security', value: 97 },
    ],
  },
  axios: {
    name: 'axios',
    sps: 78,
    tier: 'healthy',
    signals: [
      { label: 'Commits', value: 65 },
      { label: 'Maintainer', value: 72 },
      { label: 'Funding', value: 60 },
      { label: 'Issues', value: 82 },
      { label: 'Security', value: 88 },
    ],
  },
  chalk: {
    name: 'chalk',
    sps: 71,
    tier: 'watch',
    signals: [
      { label: 'Commits', value: 58 },
      { label: 'Maintainer', value: 65 },
      { label: 'Funding', value: 45 },
      { label: 'Issues', value: 78 },
      { label: 'Security', value: 85 },
    ],
  },
  webpack: {
    name: 'webpack',
    sps: 62,
    tier: 'watch',
    signals: [
      { label: 'Commits', value: 50 },
      { label: 'Maintainer', value: 55 },
      { label: 'Funding', value: 48 },
      { label: 'Issues', value: 68 },
      { label: 'Security', value: 75 },
    ],
  },
  gulp: {
    name: 'gulp',
    sps: 25,
    tier: 'at-risk',
    signals: [
      { label: 'Commits', value: 12 },
      { label: 'Maintainer', value: 18 },
      { label: 'Funding', value: 5 },
      { label: 'Issues', value: 30 },
      { label: 'Security', value: 38 },
    ],
    migration: 'Vite or esbuild',
  },
}

const SPS_RING_COLOR: Record<MarketingTier, string> = {
  critical: '#C03030',
  'at-risk': '#C47820',
  watch: '#4A7A30',
  healthy: '#35858E',
}

const SIGNAL_COLOR: Record<MarketingTier, string> = {
  critical: 'bg-dl-critical',
  'at-risk': 'bg-dl-risk',
  watch: 'bg-dl-watch',
  healthy: 'bg-dl-teal',
}

function ScoreRing({ sps, tier }: { sps: number; tier: MarketingTier }) {
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (sps / 100) * circumference
  const color = SPS_RING_COLOR[tier]

  return (
    <div className="relative flex h-[140px] w-[140px] items-center justify-center">
      <svg className="absolute inset-0" width={140} height={140} viewBox="0 0 140 140">
        <circle cx={70} cy={70} r={54} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
        <motion.circle
          cx={70}
          cy={70}
          r={54}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          transform="rotate(-90 70 70)"
        />
      </svg>
      <motion.span
        className="text-[32px] font-bold text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {sps}
      </motion.span>
    </div>
  )
}

export function SpsPlayground() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<PackageResult | null>(null)
  const [scanning, setScanning] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const handleScan = () => {
    const key = query.trim().toLowerCase()
    if (!key) return
    setScanning(true)
    setNotFound(false)
    setResult(null)

    setTimeout(() => {
      const found = MOCK_DB[key]
      if (found) {
        setResult(found)
        setNotFound(false)
      } else {
        setNotFound(true)
      }
      setScanning(false)
    }, 800)
  }

  return (
    <section className="section-dark px-6 py-[100px]">
      <motion.div
        className="mx-auto max-w-[700px] text-center"
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
        variants={staggerContainer}
      >
        <motion.p variants={sectionReveal} className="label-overline text-dl-sage">
          Try it yourself
        </motion.p>
        <motion.h2
          variants={sectionReveal}
          className="mt-4 text-section-mobile font-medium text-dl-cream lg:text-section"
        >
          Check any package&apos;s health score.
        </motion.h2>
        <motion.p variants={sectionReveal} className="mx-auto mt-4 max-w-[480px] text-[15px] text-dl-sage-light/60">
          Type a package name below to see its Survival Probability Score and signal breakdown.
        </motion.p>

        {/* Search bar */}
        <motion.div variants={sectionReveal} className="mt-10 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dl-sage-light/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="e.g. moment, lodash, express, gulp..."
              className="w-full rounded-xl border border-dl-sage-light/15 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-dl-cream placeholder:text-dl-sage-light/30 outline-none transition-colors focus:border-dl-teal/50 focus:bg-white/[0.07]"
            />
          </div>
          <button
            onClick={handleScan}
            disabled={scanning || !query.trim()}
            className="flex items-center gap-2 rounded-xl bg-dl-teal px-6 py-3.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {scanning ? (
              <motion.div
                className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            Scan
          </button>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {scanning && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-10 text-sm text-dl-sage-light/50"
            >
              Analyzing package signals...
            </motion.div>
          )}

          {notFound && !scanning && (
            <motion.div
              key="notfound"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-10 rounded-xl border border-dl-sage-light/10 bg-white/[0.03] p-6 text-sm text-dl-sage-light/60"
            >
              Package not found in demo. Try: <span className="text-dl-cream">moment</span>,{' '}
              <span className="text-dl-cream">lodash</span>, <span className="text-dl-cream">express</span>,{' '}
              <span className="text-dl-cream">gulp</span>, <span className="text-dl-cream">react</span>,{' '}
              <span className="text-dl-cream">axios</span>, <span className="text-dl-cream">webpack</span>
            </motion.div>
          )}

          {result && !scanning && (
            <motion.div
              key={result.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="mt-10 rounded-2xl border border-dl-sage-light/10 bg-white/[0.03] p-8"
            >
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10">
                {/* Score ring */}
                <div className="flex flex-col items-center gap-3">
                  <ScoreRing sps={result.sps} tier={result.tier} />
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-dl-cream">{result.name}</span>
                    <MarketingTierChip tier={result.tier} />
                  </div>
                </div>

                {/* Signal breakdown */}
                <div className="flex-1 w-full">
                  <p className="mb-4 text-left text-[11px] font-medium uppercase tracking-wide text-dl-sage-light/40">
                    Signal Breakdown
                  </p>
                  <div className="flex flex-col gap-3">
                    {result.signals.map((signal) => (
                      <div key={signal.label} className="flex items-center gap-3">
                        <span className="w-[80px] text-right text-[12px] text-dl-sage-light/50">
                          {signal.label}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${SIGNAL_COLOR[result.tier]}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${signal.value}%` }}
                            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="w-[28px] text-right font-mono text-[12px] text-dl-sage-light/60">
                          {signal.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {result.migration && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="mt-5 rounded-lg border border-dl-teal/20 bg-dl-teal/[0.06] px-4 py-2.5 text-left"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-dl-teal">
                        Migration recommendation
                      </span>
                      <p className="mt-1 text-[13px] text-dl-cream/80">
                        Consider migrating to <span className="font-medium text-dl-cream">{result.migration}</span>
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
