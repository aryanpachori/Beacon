'use client'

import { AlertTriangle, Flame, Bug, Clock, CheckCircle, TrendingUp, Shield, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { inViewOptions, sectionReveal, staggerContainer } from '@/components/marketing/motion'

const WITHOUT = [
  { icon: Flame, text: 'Production incident from abandoned package' },
  { icon: AlertTriangle, text: 'CVE alert on a package nobody maintained' },
  { icon: Bug, text: '3-month rewrite for a 2-week migration' },
  { icon: Clock, text: '"We\'ll deal with it later" — then it\'s too late' },
]

const WITH = [
  { icon: TrendingUp, text: 'Predicted abandonment 60 days early' },
  { icon: Shield, text: 'Migrated proactively — zero downtime' },
  { icon: CheckCircle, text: '2-week planned migration, not 3-month fire drill' },
  { icon: Zap, text: 'Team focuses on features, not firefighting' },
]

const slideLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const slideRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export function BeforeAfter() {
  return (
    <section className="section-light px-6 py-[100px]">
      <motion.div
        className="mx-auto max-w-[1000px]"
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
        variants={staggerContainer}
      >
        <motion.p variants={sectionReveal} className="label-overline text-center">
          The difference
        </motion.p>
        <motion.h2
          variants={sectionReveal}
          className="mx-auto mt-4 max-w-[700px] text-center text-section-mobile font-medium text-dl-text lg:text-section"
        >
          Stop reacting. Start predicting.
        </motion.h2>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Without */}
          <motion.div
            variants={slideLeft}
            className="rounded-2xl border p-7"
            style={{
              borderColor: 'color-mix(in srgb, var(--dl-critical) 20%, transparent)',
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--dl-critical) 4%, transparent) 0%, transparent 100%)'
            }}
          >
            <div className="mb-5 flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'color-mix(in srgb, var(--dl-critical) 15%, transparent)' }}
              >
                <AlertTriangle className="h-4 w-4 text-dl-critical" />
              </div>
              <span className="text-[15px] font-semibold text-dl-critical">Without Beacon</span>
            </div>
            <ul className="flex flex-col gap-3.5">
              {WITHOUT.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-[13px] text-dl-forest">
                  <Icon
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: 'color-mix(in srgb, var(--dl-critical) 60%, transparent)' }}
                  />
                  {text}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* With */}
          <motion.div
            variants={slideRight}
            className="rounded-2xl border p-7"
            style={{
              borderColor: 'color-mix(in srgb, var(--dl-teal) 20%, transparent)',
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--dl-teal) 4%, transparent) 0%, transparent 100%)'
            }}
          >
            <div className="mb-5 flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'color-mix(in srgb, var(--dl-teal) 15%, transparent)' }}
              >
                <CheckCircle className="h-4 w-4 text-dl-teal" />
              </div>
              <span className="text-[15px] font-semibold text-dl-teal">With Beacon</span>
            </div>
            <ul className="flex flex-col gap-3.5">
              {WITH.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-[13px] text-dl-forest">
                  <Icon
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: 'color-mix(in srgb, var(--dl-teal) 60%, transparent)' }}
                  />
                  {text}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
