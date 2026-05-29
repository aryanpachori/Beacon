'use client'

import { Fragment } from 'react'
import { Check, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { inViewOptions, sectionReveal } from '@/components/marketing/motion'

type CellValue = string | boolean

type Row = { feature: string; starter: CellValue; pro: CellValue }

const GROUPS: { label: string; rows: Row[] }[] = [
  {
    label: 'Repositories & packages',
    rows: [
      { feature: 'Repos', starter: '1', pro: '5' },
      { feature: 'Packages monitored', starter: '200', pro: '2,000' },
      { feature: 'Ecosystems', starter: 'npm, PyPI', pro: '+ go.mod' },
      { feature: 'Monorepo support', starter: true, pro: true },
    ],
  },
  {
    label: 'Scoring & intelligence',
    rows: [
      { feature: 'SPS scoring', starter: true, pro: true },
      { feature: 'Score history', starter: '7 days', pro: '90 days' },
      { feature: 'Migration recommendations', starter: false, pro: true },
      { feature: 'Signal breakdown', starter: false, pro: true },
      { feature: 'Predictive alerts', starter: false, pro: true },
    ],
  },
  {
    label: 'Integrations',
    rows: [
      { feature: 'Slack', starter: false, pro: true },
      { feature: 'Email digest', starter: true, pro: true },
      { feature: 'JIRA / Linear', starter: false, pro: false },
      { feature: 'REST API', starter: false, pro: false },
      { feature: 'Webhooks', starter: false, pro: false },
    ],
  },
  {
    label: 'Security & compliance',
    rows: [
      { feature: 'OSSF Scorecard', starter: true, pro: true },
      { feature: 'CVE tracking', starter: true, pro: true },
      { feature: 'CSV export', starter: false, pro: false },
      { feature: 'SOC 2 report', starter: false, pro: false },
      { feature: 'SSO / SAML', starter: false, pro: false },
      { feature: 'Private registry', starter: false, pro: false },
    ],
  },
  {
    label: 'Support',
    rows: [
      { feature: 'Community', starter: true, pro: true },
      { feature: 'Email support', starter: false, pro: true },
      { feature: 'Priority support', starter: false, pro: false },
      { feature: 'Dedicated CSM', starter: false, pro: false },
      { feature: 'SLA', starter: false, pro: false },
    ],
  },
]

function CellContent({ value }: { value: CellValue }) {
  if (value === true) return <Check className="mx-auto h-4 w-4 text-dl-teal" />
  if (value === false) return <Minus className="mx-auto h-4 w-4 text-dl-border" />
  return <span>{value}</span>
}

export function FeatureComparison() {
  return (
    <section className="bg-dl-card px-6 py-20">
      <motion.div
        className="mx-auto max-w-[720px]"
        initial="hidden"
        whileInView="visible"
        viewport={inViewOptions}
        variants={sectionReveal}
      >
        <h2 className="text-center text-[28px] font-medium text-dl-text">Full feature comparison</h2>

        <div className="mt-10 overflow-x-auto rounded-[14px] border border-dl-border bg-white">
          <table className="w-full min-w-[480px] table-fixed text-center text-[13px] text-dl-forest">
            <thead>
              <tr className="border-b border-dl-border">
                <th className="w-[50%] px-4 py-3 text-left font-medium text-dl-text">Feature</th>
                <th className="px-3 py-3 font-medium text-dl-muted">Starter</th>
                <th className="bg-dl-teal px-3 py-3 font-medium text-white">Pro</th>
              </tr>
            </thead>
            <tbody>
              {GROUPS.map((group) => (
                <Fragment key={group.label}>
                  <tr className="bg-dl-cream">
                    <td colSpan={3} className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-dl-teal">
                      {group.label}
                    </td>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.feature} className="border-t border-dl-border/60">
                      <td className="px-4 py-3 text-left font-medium text-dl-forest">{row.feature}</td>
                      <td className="px-3 py-3">
                        <CellContent value={row.starter} />
                      </td>
                      <td className="bg-dl-teal/5 px-3 py-3">
                        <CellContent value={row.pro} />
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </section>
  )
}
