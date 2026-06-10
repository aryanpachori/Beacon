'use client'

import { Check, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { inViewOptions, sectionReveal } from '@/components/marketing/motion'

type CellValue = 'yes' | 'no' | 'partial'

const ROWS: { feature: string; driftlogg: CellValue; snyk: CellValue; dependabot: CellValue; ossf: CellValue }[] = [
  { feature: 'Predictive abandonment score', driftlogg: 'yes', snyk: 'no', dependabot: 'no', ossf: 'no' },
  { feature: '60–90 day survival forecast', driftlogg: 'yes', snyk: 'no', dependabot: 'no', ossf: 'no' },
  { feature: 'Migration recommendations', driftlogg: 'yes', snyk: 'partial', dependabot: 'partial', ossf: 'no' },
  { feature: 'Known CVE detection', driftlogg: 'yes', snyk: 'yes', dependabot: 'yes', ossf: 'partial' },
  { feature: 'Maintainer activity signals', driftlogg: 'yes', snyk: 'no', dependabot: 'no', ossf: 'yes' },
  { feature: 'Funding gap detection', driftlogg: 'yes', snyk: 'no', dependabot: 'no', ossf: 'no' },
  { feature: 'Slack + JIRA alerts', driftlogg: 'yes', snyk: 'yes', dependabot: 'partial', ossf: 'no' },
  { feature: 'OSSF Scorecard integration', driftlogg: 'yes', snyk: 'partial', dependabot: 'no', ossf: 'yes' },
]

function Cell({ value, isDriftLogg }: { value: CellValue; isDriftLogg?: boolean }) {
  if (value === 'yes')
    return (
      <Check
        className={`mx-auto ${isDriftLogg ? 'h-5 w-5 text-dl-teal' : 'h-4 w-4 text-dl-teal/70'}`}
      />
    )
  if (value === 'partial') return <span className="text-dl-hint">partial</span>
  return <Minus className="mx-auto h-4 w-4 text-dl-border" />
}

export function ComparisonTable() {
  return (
    <section id="compare" className="section-light px-6 py-[100px]">
      <motion.div
        className="mx-auto max-w-[900px]"
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
        variants={sectionReveal}
      >
        <p className="label-overline text-dl-sage">How we compare</p>
        <h2 className="mt-4 text-section-mobile font-medium text-dl-text lg:text-section">
          Built for prediction, not reaction.
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          viewport={inViewOptions}
          className="mt-10 overflow-hidden rounded-[14px] border border-dl-border bg-dl-card"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-center text-[13px] text-dl-forest">
              <thead>
                <tr className="border-b border-dl-border bg-dl-card">
                  <th className="px-4 py-3 text-left font-medium text-dl-text">Feature</th>
                  <th className="relative px-4 py-3 font-medium text-white">
                    <div className="absolute inset-0 bg-dl-teal" />
                    <span className="relative z-10">DriftLogg</span>
                  </th>
                  <th className="px-4 py-3 font-medium text-dl-muted">Snyk</th>
                  <th className="px-4 py-3 font-medium text-dl-muted">Dependabot</th>
                  <th className="px-4 py-3 font-medium text-dl-muted">OSSF Scorecard</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`transition-colors hover:bg-dl-teal/[0.04] ${
                      i % 2 === 0 ? 'bg-dl-card' : 'bg-dl-cream'
                    }`}
                  >
                    <td className="px-4 py-3 text-left font-medium text-dl-forest">{row.feature}</td>
                    <td className="bg-dl-teal/[0.06] px-4 py-3">
                      <Cell value={row.driftlogg} isDriftLogg />
                    </td>
                    <td className="px-4 py-3">
                      <Cell value={row.snyk} />
                    </td>
                    <td className="px-4 py-3">
                      <Cell value={row.dependabot} />
                    </td>
                    <td className="px-4 py-3">
                      <Cell value={row.ossf} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <p className="mt-4 text-center text-[11px] text-dl-hint">
          Comparison based on publicly available feature documentation as of March 2026.
        </p>
      </motion.div>
    </section>
  )
}
