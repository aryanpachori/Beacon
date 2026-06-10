'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { inViewOptions, sectionReveal, staggerContainer } from '@/components/marketing/motion'

const STEPS = [
  {
    title: 'Install GitHub App',
    copy: 'One-click installation. Read-only access to your manifest files only. No source code, no secrets.',
  },
  {
    title: 'Select your repos',
    copy: 'Choose which repositories to monitor — individual repos or your entire org. Monorepo support included.',
  },
  {
    title: 'We scan and score',
    copy: 'DriftLogg reads your dependency manifests, collects signals from 8 external sources, and runs our XGBoost survival model.',
  },
  {
    title: 'Get your risk dashboard',
    copy: 'A ranked board of every dependency scored 0–100. Critical packages surface first. Migration recommendations included.',
  },
]

const stepCircle = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 200, damping: 18 },
  },
}

const stepText = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28 } },
}

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.8', 'center center'],
  })
  const lineWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const dotLeft = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const dotOpacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0])

  return (
    <section ref={sectionRef} id="how-it-works" className="section-cream px-6 py-[100px]">
      <motion.div
        className="mx-auto max-w-[1100px]"
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
        variants={staggerContainer}
      >
        <motion.p variants={sectionReveal} className="label-overline text-dl-sage">
          How it works
        </motion.p>
        <motion.h2
          variants={sectionReveal}
          className="mt-4 text-section-mobile font-medium text-dl-text lg:text-section"
        >
          From connection to insight in under 60 seconds.
        </motion.h2>

        <div className="relative mt-14 grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-6">
          {/* Animated progress line */}
          <div className="absolute left-[18px] right-[calc(25%-18px)] top-[18px] hidden h-px bg-dl-border-mid/30 md:block">
            <motion.div
              className="absolute inset-y-0 left-0 bg-dl-teal"
              style={{ width: lineWidth }}
            />
            {/* Traveling dot */}
            <motion.div
              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-dl-teal shadow-[0_0_12px_rgba(53,133,142,0.6)]"
              style={{ left: dotLeft, opacity: dotOpacity }}
            />
          </div>

          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              variants={staggerContainer}
              custom={i}
              className="relative flex flex-col items-center text-center md:items-start md:text-left"
            >
              <motion.div
                variants={stepCircle}
                transition={{ delay: i * 0.15 }}
                className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-dl-teal text-sm font-medium text-white"
              >
                {i + 1}
              </motion.div>
              <motion.h3 variants={stepText} className="mt-4 text-base font-medium text-dl-text">
                {step.title}
              </motion.h3>
              <motion.p variants={stepText} className="mt-2 text-[13px] text-dl-muted">
                {step.copy}
              </motion.p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
