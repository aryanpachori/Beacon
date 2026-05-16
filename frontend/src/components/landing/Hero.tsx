'use client'

import Link from 'next/link'
import { Lock, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { SparklineBars } from '@/components/marketing/SparklineBars'
import { MarketingTierChip } from '@/components/marketing/MarketingTierChip'
import { inViewOptions, staggerContainer } from '@/components/marketing/motion'

const textStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const textItem = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease: 'easeOut' } },
}

const MOCK_PACKAGES = [
  { abbr: 'mo', name: 'moment', version: '2.29.4', tier: 'critical' as const, sps: 11, trend: 'declining' as const },
  { abbr: 'rq', name: 'request', version: '2.88.2', tier: 'at-risk' as const, sps: 32, trend: 'declining' as const },
  { abbr: 'ld', name: 'lodash', version: '4.17.21', tier: 'healthy' as const, sps: 84, trend: 'rising' as const },
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

function PackageRow({
  abbr,
  name,
  version,
  tier,
  sps,
  trend,
}: (typeof MOCK_PACKAGES)[0]) {
  return (
    <div className="flex items-center gap-3 border-t border-dl-sage-light/10 py-3 first:border-t-0 first:pt-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-dl-sage-light/15 font-mono text-[11px] font-medium text-dl-sage-light">
        {abbr}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-dl-cream">{name}</p>
        <p className="text-xs text-dl-sage-light/50">{version}</p>
      </div>
      <SparklineBars trend={trend} color={SPARK_COLOR[tier]} />
      <span className={`w-8 text-right font-mono text-sm font-medium ${SPS_COLOR[tier]}`}>{sps}</span>
      <MarketingTierChip tier={tier} />
    </div>
  )
}

export function Hero() {
  return (
    <section className="section-dark min-h-[680px] lg:min-h-screen">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-6 pb-[100px] pt-[120px] lg:grid-cols-[55%_45%] lg:items-center">
        <motion.div
          variants={textStagger}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOptions}
        >
          <motion.p variants={textItem} className="label-overline border-l border-dl-sage pl-3 text-dl-sage">
            Predictive dependency intelligence
          </motion.p>
          <motion.h1
            variants={textItem}
            className="mt-6 text-hero-mobile text-dl-cream lg:text-hero"
          >
            Know which packages are dying — 60 days before they do.
          </motion.h1>
          <motion.p
            variants={textItem}
            className="mt-5 max-w-[480px] text-base text-dl-sage-light/70"
          >
            DriftLogg monitors every open source dependency in your codebase and predicts abandonment
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
          <motion.div variants={textItem} className="mt-6 flex flex-wrap gap-5 text-xs text-dl-sage-light/50">
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
          className="rounded-2xl border border-dl-sage-light/20 bg-white/5 p-5 shadow-[0_0_60px_rgba(53,133,142,0.15)]"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-dl-cream">Dependency health</span>
            <span className="flex items-center gap-1.5 text-xs text-dl-sage-light">
              <motion.span
                className="h-2 w-2 rounded-full bg-dl-healthy"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              Live
            </span>
          </div>
          {MOCK_PACKAGES.map((pkg) => (
            <PackageRow key={pkg.name} {...pkg} />
          ))}
        </div>
      </div>
    </section>
  )
}
