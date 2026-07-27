'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Terminal, GitBranch, Cpu } from 'lucide-react'
import { CodeIntelligenceDemo } from '@/components/landing/CodeIntelligenceDemo'
import { inViewOptions } from '@/components/marketing/motion'

const textStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const textItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export function Hero() {
  return (
    <section className="section-light relative overflow-hidden">
      <div className="ambient-grid pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-10 mx-auto max-w-[1180px] px-6 pb-20 pt-[112px] lg:pb-28 lg:pt-[152px]">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,52%)_minmax(0,42%)] lg:items-center lg:gap-[6%]">
          <motion.div
            variants={textStagger}
            initial="hidden"
            whileInView="visible"
            viewport={inViewOptions}
          >
            <motion.p
              variants={textItem}
              className="flex items-center gap-2 text-[13px] text-dl-muted"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-dl-blue" />
              Your AI Security Engineer
            </motion.p>
            <motion.h1
              variants={textItem}
              className="mt-7 text-hero-mobile text-dl-navy lg:text-hero"
            >
              Security that ships with <span className="font-serif italic font-normal text-dl-blue">AI</span>.
            </motion.h1>
            <motion.p
              variants={textItem}
              className="mt-7 max-w-[460px] text-[16px] leading-relaxed text-dl-forest"
            >
              Beacon lives inside your workflow — an IDE extension, an MCP server, a CLI —
              and quietly reviews every line your AI agents write. Local-first.
              Zero repo access. Nothing to configure.
            </motion.p>
            <motion.div variants={textItem} className="mt-9 flex flex-wrap items-center gap-5">
              <Link href="/register" className="btn-primary">
                Install Beacon — free
              </Link>
              <a href="#how-it-works" className="text-[13.5px] text-dl-forest underline decoration-dl-border underline-offset-4 transition-colors hover:text-dl-navy hover:decoration-dl-muted">
                See it in action
              </a>
            </motion.div>
            <motion.div variants={textItem} className="mt-12 flex flex-wrap gap-x-7 gap-y-2 border-t border-dl-border pt-6 text-xs text-dl-muted">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5" />
                IDE · MCP · CLI
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" />
                Runs entirely on your machine
              </span>
              <span className="flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5" />
                Never touches your repo
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            viewport={inViewOptions}
          >
            <CodeIntelligenceDemo />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
