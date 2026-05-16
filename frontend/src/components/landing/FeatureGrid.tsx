'use client'

import {
  TrendingDown,
  GitBranch,
  Bell,
  ArrowRightLeft,
  BarChart2,
  Shield,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { inViewOptions, sectionReveal, staggerContainer, staggerFast } from '@/components/marketing/motion'

const FEATURES = [
  {
    icon: TrendingDown,
    name: '60–90 day survival forecast',
    description:
      'Our XGBoost model predicts package abandonment probability before the signals become obvious.',
  },
  {
    icon: GitBranch,
    name: 'GitHub App integration',
    description:
      'One-click read-only connection. Supports monorepos, multiple manifest formats, and org-wide scanning.',
  },
  {
    icon: Bell,
    name: 'Threshold alerts',
    description:
      'Configure SPS drop thresholds per org. Get notified in Slack, email, or JIRA the moment a package crosses your line.',
  },
  {
    icon: ArrowRightLeft,
    name: 'Migration recommendations',
    description:
      'When a package falls, DriftLogg surfaces ranked replacement packages with estimated migration effort.',
  },
  {
    icon: BarChart2,
    name: 'Signal breakdown',
    description:
      'Six weighted signal categories — commit velocity, maintainer activity, funding, issues, community, security — visualised per package.',
  },
  {
    icon: Shield,
    name: 'Security hygiene tracking',
    description:
      'Days since last release, CVE age, and OSSF Scorecard delta tracked continuously alongside health signals.',
  },
]

export function FeatureGrid() {
  return (
    <section id="features" className="section-light px-6 py-[100px]">
      <motion.div
        className="mx-auto max-w-[1200px]"
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
        variants={staggerContainer}
      >
        <motion.p variants={sectionReveal} className="label-overline text-dl-sage">
          Features
        </motion.p>
        <motion.h2
          variants={sectionReveal}
          className="mt-4 max-w-[640px] text-section-mobile font-medium text-dl-text lg:text-section"
        >
          Everything engineering teams need to stay ahead of dependency rot.
        </motion.h2>

        <motion.div
          variants={staggerFast}
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map(({ icon: Icon, name, description }) => (
            <motion.div
              key={name}
              variants={sectionReveal}
              className="dl-card"
            >
              <Icon className="h-[22px] w-[22px] text-dl-teal" />
              <h3 className="mt-4 text-[15px] font-medium text-dl-text">{name}</h3>
              <p className="mt-2 text-[13px] text-dl-muted">{description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
