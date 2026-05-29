'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { inViewOptions, sectionReveal } from '@/components/marketing/motion'

const FAQS = [
  {
    q: 'What counts as a package?',
    a: 'Any dependency listed in your lockfile or manifest — npm, PyPI, Cargo, Maven, or go.mod. Transitive dependencies are included.',
  },
  {
    q: 'How is the SPS score calculated?',
    a: 'We combine 12 signals: commit frequency, maintainer activity, issue response time, download trends, bus factor, and more. Each is weighted and normalized to 0–100.',
  },
  {
    q: 'What is included in Pro?',
    a: 'Pro adds more repos, Slack alerts, migration recommendations, 90-day score history, and signal breakdown. Starter stays free for one repo.',
  },
  {
    q: 'What happens when I exceed my package limit?',
    a: 'We notify you at 80% and 100%. New packages stop scoring until you upgrade or remove repos.',
  },
  {
    q: 'Do you store our source code?',
    a: 'Never. We only read dependency manifests and public registry metadata via read-only GitHub access.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from billing settings. You keep access until the end of your billing period.',
  },
  {
    q: 'How does annual billing work?',
    a: 'Pay yearly upfront and save 20% on Pro. You can switch between monthly and annual anytime from billing settings.',
  },
]

export function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="section-light px-6 py-20">
      <motion.div
        className="mx-auto max-w-[640px]"
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
        variants={sectionReveal}
      >
        <h2 className="text-center text-[28px] font-medium text-dl-text">Pricing FAQ</h2>
        <div className="mt-10 divide-y divide-dl-border">
          {FAQS.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <motion.div key={item.q} layout className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="text-[15px] font-medium text-dl-text">{item.q}</span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-5 w-5 shrink-0 text-dl-muted" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="pt-3 text-sm leading-relaxed text-dl-muted">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </section>
  )
}
