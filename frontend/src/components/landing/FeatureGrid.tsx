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
  return (
    <section id="features" data-scroll-features className="section-light px-6 py-[120px]">
      <div className="mx-auto max-w-[1180px]">
        <p data-scroll-reveal className="section-kicker">
          <span className="kicker-index">04</span> Features
        </p>
        <h2
          data-scroll-reveal
          className="mt-5 max-w-[560px] text-section-mobile font-medium text-dl-text lg:text-section"
        >
          Everything it takes to trust AI-generated code.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, name, description, hoverAnim }) => (
            <motion.div
              key={name}
              data-scroll-feature-card
              className="group flex h-full flex-col rounded-[14px] border border-dl-border/40 p-6 transition-colors duration-300 hover:border-dl-blue/30"
              whileHover="hovered"
            >
              <motion.div variants={{ hovered: hoverAnim }} className="inline-block">
                <Icon className="h-5 w-5 text-dl-blue" strokeWidth={1.75} />
              </motion.div>
              <h3 className="mt-4 text-[15px] font-medium text-dl-text">{name}</h3>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-dl-muted">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
