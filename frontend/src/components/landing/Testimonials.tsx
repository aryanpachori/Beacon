'use client'

import { motion } from 'framer-motion'
import { inViewOptions, sectionReveal, staggerContainer } from '@/components/marketing/motion'

const TESTIMONIALS = [
  {
    quote:
      'We caught a critical abandonment in node-sass six weeks before our CI started failing. The migration recommendation pointed us straight to sass. Saved an entire sprint.',
    name: 'Priya M.',
    role: 'VP Engineering at Stackery',
    initials: 'PM',
  },
  {
    quote:
      'DriftLogg is the first tool that tells me what\'s about to break, not what already has. That\'s a completely different kind of value for a platform team.',
    name: 'Rohan D.',
    role: 'Senior Platform Engineer at BuildCo',
    initials: 'RD',
  },
  {
    quote:
      'We were asked to demonstrate software supply chain security posture to auditors. DriftLogg gave us the report we needed in one export. That alone justified the subscription.',
    name: 'Aditya K.',
    role: 'CTO at ShipFast',
    initials: 'AK',
  },
]

export function Testimonials() {
  return (
    <section className="bg-dl-card px-6 py-[100px]">
      <motion.div
        className="mx-auto max-w-[1100px]"
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
        variants={staggerContainer}
      >
        <motion.p variants={sectionReveal} className="label-overline text-dl-sage">
          What engineers say
        </motion.p>
        <motion.h2
          variants={sectionReveal}
          className="mt-4 text-section-mobile font-medium text-dl-text lg:text-section"
        >
          Teams that stopped firefighting.
        </motion.h2>

        <motion.div
          variants={staggerContainer}
          className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={sectionReveal}
              className="rounded-[14px] border border-dl-border bg-white p-7"
            >
              <span className="text-5xl font-light leading-none text-dl-sage-light">&ldquo;</span>
              <p className="mt-2 text-[15px] italic leading-relaxed text-dl-forest">{t.quote}</p>
              <motion.div variants={sectionReveal} className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-dl-cream text-[13px] font-medium text-dl-teal">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-dl-text">{t.name}</p>
                  <p className="text-xs text-dl-muted">{t.role}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
