'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { inViewOptions, sectionReveal, staggerContainer } from '@/components/marketing/motion'

const STEPS = [
  {
    title: 'Add Beacon to your tools',
    copy: 'Install the IDE extension, connect the MCP server to your agent, or drop the CLI into CI. Under a minute, no config files.',
  },
  {
    title: 'Keep working. Keep agenting.',
    copy: 'Beacon runs alongside Cursor, Claude Code, Copilot, or any MCP-compatible agent — watching diffs as they\u2019re written, not after.',
  },
  {
    title: 'It reviews in real time, locally',
    copy: 'Every new line is checked against known vulnerability patterns, secrets, and unsafe logic — entirely on your machine. Nothing leaves it.',
  },
  {
    title: 'Get an inline verdict, not a report',
    copy: 'Findings surface as annotations right where the risk is, with a suggested fix ready to accept. No dashboards to check later.',
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
    <section ref={sectionRef} id="how-it-works" className="section-cream px-6 py-[120px]">
      <motion.div
        className="mx-auto max-w-[1080px]"
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
        variants={staggerContainer}
      >
        <motion.p variants={sectionReveal} className="section-kicker">
          <span className="kicker-index">03</span> How it works
        </motion.p>
        <motion.h2
          variants={sectionReveal}
          className="mt-5 max-w-[560px] text-section-mobile font-medium text-dl-text lg:text-section"
        >
          From install to invisible in under 60 seconds.
        </motion.h2>

        <div className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8">
          {/* Animated progress line */}
          <div className="absolute left-0 right-[calc(25%)] top-[13px] hidden h-px bg-dl-border md:block">
            <motion.div
              className="absolute inset-y-0 left-0 bg-dl-blue/70"
              style={{ width: lineWidth }}
            />
            {/* Traveling dot */}
            <motion.div
              className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-dl-blue"
              style={{ left: dotLeft, opacity: dotOpacity }}
            />
          </div>

          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              variants={staggerContainer}
              custom={i}
              className="relative flex flex-col items-start text-left"
            >
              <motion.div
                variants={stepCircle}
                transition={{ delay: i * 0.15 }}
                className="relative z-10 font-serif italic text-[15px] text-dl-blue"
              >
                {String(i + 1).padStart(2, '0')}
              </motion.div>
              <motion.h3 variants={stepText} className="mt-4 text-[15px] font-medium text-dl-text">
                {step.title}
              </motion.h3>
              <motion.p variants={stepText} className="mt-2 text-[13px] leading-relaxed text-dl-muted">
                {step.copy}
              </motion.p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
