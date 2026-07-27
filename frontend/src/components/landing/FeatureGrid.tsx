'use client'

import {
  Sparkles,
  Terminal,
  Cpu,
  GitBranch,
  KeyRound,
  ScanLine,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { inViewOptions, sectionReveal, staggerContainer, staggerFast } from '@/components/marketing/motion'

const FEATURES = [
  {
    icon: Sparkles,
    name: 'Real-time inline review',
    description:
      'Beacon annotates risky code the moment it\u2019s written — no waiting for CI, no separate dashboard to check.',
    hoverAnim: { y: [0, -3, 0], transition: { duration: 0.5, repeat: Infinity, repeatDelay: 0.8 } },
  },
  {
    icon: Terminal,
    name: 'IDE, MCP, and CLI — your choice',
    description:
      'Works as a native extension in your editor, an MCP server your agent calls directly, or a CLI step in CI.',
    hoverAnim: { scale: [1, 1.15, 1], transition: { duration: 0.6, repeat: Infinity, repeatDelay: 1 } },
  },
  {
    icon: Cpu,
    name: 'Local-first, always',
    description:
      'Analysis runs on your machine. Your source never leaves your environment — Beacon has zero repo access by design.',
    hoverAnim: { rotate: [0, -8, 8, -5, 4, 0], transition: { duration: 0.6 } },
  },
  {
    icon: KeyRound,
    name: 'Secret & credential detection',
    description:
      'Catches hardcoded keys, tokens, and credentials the instant an agent writes them — before they\u2019re staged.',
    hoverAnim: { x: [0, 4, -4, 0], transition: { duration: 0.5, repeat: Infinity, repeatDelay: 0.8 } },
  },
  {
    icon: ScanLine,
    name: 'Vulnerability pattern intelligence',
    description:
      'Injection, broken auth, unsafe deserialization, and more — modeled from real-world CVEs, checked on every diff.',
    hoverAnim: { scaleY: [1, 1.2, 0.9, 1.1, 1], transition: { duration: 0.6 } },
  },
  {
    icon: GitBranch,
    name: 'Agent-aware context',
    description:
      'Beacon understands agent-generated diffs specifically — tuned for the patterns Cursor, Claude Code, and Copilot actually produce.',
    hoverAnim: { scale: [1, 1.1, 1], transition: { duration: 0.4, repeat: Infinity, repeatDelay: 1.2 } },
  },
]

export function FeatureGrid() {
  const [featured, ...rest] = FEATURES

  return (
    <section id="features" className="section-light px-6 py-[120px]">
      <motion.div
        className="mx-auto max-w-[1180px]"
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
        variants={staggerContainer}
      >
        <motion.p variants={sectionReveal} className="section-kicker">
          <span className="kicker-index">04</span> Features
        </motion.p>
        <motion.h2
          variants={sectionReveal}
          className="mt-5 max-w-[560px] text-section-mobile font-medium text-dl-text lg:text-section"
        >
          Everything it takes to trust AI-generated code.
        </motion.h2>

        <motion.div
          variants={staggerFast}
          className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-2"
        >
          {/* Featured tile — spans two rows, breaks the card-after-card rhythm */}
          <motion.div
            variants={sectionReveal}
            className="group relative overflow-hidden rounded-[14px] border border-dl-border bg-dl-card p-8 transition-all duration-300 hover:border-dl-blue/20 lg:row-span-2 lg:flex lg:flex-col lg:justify-between"
            whileHover="hovered"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-dl-blue/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative">
              <motion.div variants={{ hovered: featured.hoverAnim }} className="inline-block">
                <featured.icon className="h-6 w-6 text-dl-blue" strokeWidth={1.75} />
              </motion.div>
              <h3 className="mt-6 text-[19px] font-medium leading-snug text-dl-text">{featured.name}</h3>
              <p className="mt-3 max-w-[280px] text-[13.5px] leading-relaxed text-dl-muted">{featured.description}</p>
            </div>
            <span className="relative mt-10 font-serif italic text-sm text-dl-muted/60">Core</span>
          </motion.div>

          {rest.map(({ icon: Icon, name, description, hoverAnim }) => (
            <motion.div
              key={name}
              variants={sectionReveal}
              className="group relative overflow-hidden rounded-[14px] border border-dl-border bg-dl-card p-6 transition-all duration-300 hover:border-dl-blue/20"
              whileHover="hovered"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-dl-blue/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <motion.div variants={{ hovered: hoverAnim }} className="inline-block">
                  <Icon className="h-5 w-5 text-dl-blue" strokeWidth={1.75} />
                </motion.div>
                <h3 className="mt-4 text-[14.5px] font-medium text-dl-text">{name}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-dl-muted">{description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
