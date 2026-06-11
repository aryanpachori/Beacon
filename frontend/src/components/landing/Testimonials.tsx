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
    gradient: 'from-dl-teal to-dl-sage',
  },
  {
    quote:
      'DriftLogg is the first tool that tells me what\'s about to break, not what already has. That\'s a completely different kind of value for a platform team.',
    name: 'Rohan D.',
    role: 'Senior Platform Engineer at BuildCo',
    initials: 'RD',
    gradient: 'from-dl-sage to-dl-forest',
  },
  {
    quote:
      'We were asked to demonstrate software supply chain security posture to auditors. DriftLogg gave us the report we needed in one export. That alone justified the subscription.',
    name: 'Aditya K.',
    role: 'CTO at ShipFast',
    initials: 'AK',
    gradient: 'from-dl-forest to-dl-teal',
  },
  {
    quote:
      'Our security team used to spend hours triaging dependency alerts. DriftLogg cut our triage time by 70% because we only look at things that are actually at risk of dying.',
    name: 'Sarah L.',
    role: 'Security Lead at NovaTech',
    initials: 'SL',
    gradient: 'from-dl-critical to-dl-risk',
  },
  {
    quote:
      'I integrated DriftLogg into our CI pipeline. When a dependency drops below SPS 40, it auto-creates a migration ticket in JIRA. Our tech debt backlog finally has signal.',
    name: 'Marcus W.',
    role: 'DevOps Manager at CloudScale',
    initials: 'MW',
    gradient: 'from-dl-teal to-dl-cream',
  },
  {
    quote:
      'We went from "we should probably upgrade moment" to "we have 47 days before risk is critical." That kind of specificity changes how leadership funds migration work.',
    name: 'Deepa R.',
    role: 'Staff Engineer at Acme Corp',
    initials: 'DR',
    gradient: 'from-dl-sage to-dl-teal',
  },
]

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-dl-card py-[100px]">
      <motion.div
        className="mx-auto max-w-[1100px] px-6"
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
      </motion.div>

      {/* Full-width Marquee Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={inViewOptions}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative mt-16 w-full overflow-hidden"
      >
        {/* Left and Right Fade Overlays */}
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-12 testimonial-fade-left z-10 sm:w-24" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-12 testimonial-fade-right z-10 sm:w-24" />

        <div className="animate-marquee gap-6 py-4">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
            <div
              key={`${t.name}-${idx}`}
              className="w-[290px] sm:w-[360px] shrink-0 rounded-[14px] border border-dl-border bg-dl-page p-7 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <span className="text-5xl font-light leading-none text-dl-sage-light select-none">&ldquo;</span>
              <p className="mt-2 text-[15px] italic leading-relaxed text-dl-forest">{t.quote}</p>
              <div className="mt-6 flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-[13px] font-medium text-white`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-dl-text">{t.name}</p>
                  <p className="text-xs text-dl-muted">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
