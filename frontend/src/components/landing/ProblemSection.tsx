'use client'

import { motion } from 'framer-motion'
import { inViewOptions, sectionReveal, staggerContainer } from '@/components/marketing/motion'

const rowItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' } },
}

const ROWS = [
  {
    index: '01',
    title: 'AI ships faster than review can keep up.',
    copy: 'Agents write hundreds of lines a minute. Human review was built for a world where code arrived one PR at a time — that world is gone.',
  },
  {
    index: '02',
    title: 'Traditional scanners run too late.',
    copy: 'SAST tools fire in CI, long after the code is written and the context is gone. By then, fixing it feels like an interruption, not a safeguard.',
  },
  {
    index: '03',
    title: 'You end up reviewing the AI, not your product.',
    copy: 'Every AI-authored diff becomes homework. Teams either slow down to check everything, or ship and hope. Neither should be the choice.',
  },
]

export function ProblemSection() {
  return (
    <section className="section-light px-6 py-[120px]">
      <div className="mx-auto max-w-[1080px]">
        <motion.div
          className="grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOptions}
        >
          <div>
            <motion.p variants={sectionReveal} className="section-kicker">
              <span className="kicker-index">01</span> The problem
            </motion.p>
            <motion.h2
              variants={sectionReveal}
              className="mt-5 max-w-[420px] text-section-mobile font-medium text-dl-text lg:text-section"
            >
              AI writes the code now. Nobody&apos;s watching it as closely.
            </motion.h2>
            <motion.p variants={sectionReveal} className="mt-6 max-w-[400px] text-[15px] leading-relaxed text-dl-muted">
              Agentic coding tools generate secrets, injections, and broken auth checks just
              as easily as they generate working features. The bottleneck isn&apos;t writing
              code anymore — it&apos;s knowing which lines to trust.
            </motion.p>
          </div>

          <div className="flex flex-col divide-y divide-dl-border border-t border-dl-border lg:border-t-0">
            {ROWS.map(({ index, title, copy }) => (
              <motion.div key={index} variants={rowItem} className="grid grid-cols-[auto_1fr] gap-6 py-7 first:pt-0 lg:first:pt-0">
                <span className="font-serif italic text-xl text-dl-muted/70">{index}</span>
                <div>
                  <h3 className="text-[16px] font-medium text-dl-text">{title}</h3>
                  <p className="mt-2 max-w-[440px] text-[13.5px] leading-relaxed text-dl-muted">{copy}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
