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
    hoverAnim: { y: [0, -3, 0], transition: { duration: 0.5, repeat: Infinity, repeatDelay: 0.8 } },
  },
  {
    icon: GitBranch,
    name: 'GitHub App integration',
    description:
      'One-click read-only connection. Supports monorepos, multiple manifest formats, and org-wide scanning.',
    hoverAnim: { scale: [1, 1.15, 1], transition: { duration: 0.6, repeat: Infinity, repeatDelay: 1 } },
  },
  {
    icon: Bell,
    name: 'Threshold alerts',
    description:
      'Configure SPS drop thresholds per org. Get notified in Slack, email, or JIRA the moment a package crosses your line.',
    hoverAnim: { rotate: [0, -12, 12, -8, 6, 0], transition: { duration: 0.6 } },
  },
  {
    icon: ArrowRightLeft,
    name: 'Migration recommendations',
    description:
      'When a package falls, Beacon surfaces ranked replacement packages with estimated migration effort.',
    hoverAnim: { x: [0, 4, -4, 0], transition: { duration: 0.5, repeat: Infinity, repeatDelay: 0.8 } },
  },
  {
    icon: BarChart2,
    name: 'Signal breakdown',
    description:
      'Six weighted signal categories — commit velocity, maintainer activity, funding, issues, community, security — visualized per package.',
    hoverAnim: { scaleY: [1, 1.2, 0.9, 1.1, 1], transition: { duration: 0.6 } },
  },
  {
    icon: Shield,
    name: 'Security hygiene tracking',
    description:
      'Days since last release, CVE age, and OSSF Scorecard delta tracked continuously alongside health signals.',
    hoverAnim: { scale: [1, 1.1, 1], transition: { duration: 0.4, repeat: Infinity, repeatDelay: 1.2 } },
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
        <motion.p variants={sectionReveal} className="label-overline">
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
          {FEATURES.map(({ icon: Icon, name, description, hoverAnim }) => (
            <motion.div
              key={name}
              variants={sectionReveal}
              className="group dl-card relative overflow-hidden transition-all duration-300 hover:border-dl-teal/30 hover:shadow-[0_0_30px_rgba(53,133,142,0.08)]"
              whileHover="hovered"
            >
              {/* Subtle gradient glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-dl-teal/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <motion.div
                  variants={{ hovered: hoverAnim }}
                  className="inline-block"
                >
                  <Icon className="h-[22px] w-[22px] text-dl-teal" />
                </motion.div>
                <h3 className="mt-4 text-[15px] font-medium text-dl-text">{name}</h3>
                <p className="mt-2 text-[13px] text-neutral-600">{description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
