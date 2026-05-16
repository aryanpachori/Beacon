'use client'

import Link from 'next/link'
import { Lock, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { inViewOptions, sectionReveal } from '@/components/marketing/motion'

export function FinalCTA() {
  return (
    <section className="section-dark px-6 py-[120px]">
      <motion.div
        className="mx-auto max-w-[800px] text-center"
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
        variants={sectionReveal}
      >
        <h2 className="text-[36px] font-medium leading-tight text-dl-cream md:text-[40px]">
          Start protecting your stack today.
        </h2>
        <p className="mx-auto mt-5 max-w-[480px] text-base text-dl-sage-light/65">
          Free for one repo. No credit card. GitHub App installs in 60 seconds.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register" className="btn-primary">
            Start free →
          </Link>
          <Link href="#" className="btn-ghost">
            Talk to us
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-dl-sage-light/50">
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
        </div>
      </motion.div>
    </section>
  )
}
