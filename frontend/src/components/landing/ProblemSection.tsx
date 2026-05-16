'use client'

import { AlertTriangle, Clock, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { inViewOptions, sectionReveal, staggerContainer } from '@/components/marketing/motion'

const cardItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
}

const CARDS = [
  {
    icon: AlertTriangle,
    title: 'You find out too late.',
    copy: 'A failed build. A CVE alert. A broken upgrade path. These are lagging indicators that arrive long after the cheapest fix window has closed.',
  },
  {
    icon: Clock,
    title: 'Migration debt compounds.',
    copy: 'A 2-week migration this quarter becomes a 3-month rewrite in 18 months. Every deferred decision costs exponentially more.',
  },
  {
    icon: EyeOff,
    title: 'No signal, no warning.',
    copy: 'Existing tools flag known CVEs reactively. None model the 60–90 day window when maintainer decay is still reversible.',
  },
]

export function ProblemSection() {
  return (
    <section className="section-light px-6 py-[100px]">
      <motion.div
        className="mx-auto max-w-[1000px] text-center"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
      >
        <motion.p variants={sectionReveal} className="label-overline text-dl-sage">
          The problem
        </motion.p>
        <motion.h2
          variants={sectionReveal}
          className="mx-auto mt-4 max-w-[700px] text-section-mobile font-medium text-dl-text lg:text-section"
        >
          Your dependencies are decaying. You just don&apos;t know it yet.
        </motion.h2>
        <motion.p variants={sectionReveal} className="mx-auto mt-5 max-w-[640px] text-base text-dl-muted">
          90% of modern software runs on open source. A meaningful fraction of those packages will lose
          their maintainers this year — silently. By the time your build breaks or your security scanner
          fires, the optimal window for low-cost migration has already closed.
        </motion.p>

        <motion.div
          variants={staggerContainer}
          className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3"
        >
          {CARDS.map(({ icon: Icon, title, copy }) => (
            <motion.div
              key={title}
              variants={cardItem}
              className="rounded-[14px] border border-dl-border bg-dl-card p-7 text-left"
            >
              <motion.div
                variants={cardItem}
                className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-dl-danger/20"
              >
                <Icon className="h-6 w-6 text-dl-danger" />
              </div>
              <h3 className="text-[17px] font-medium text-dl-text">{title}</h3>
              <p className="mt-2 text-sm text-dl-muted">{copy}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
