'use client'

import { Check, Minus } from 'lucide-react'

type CellValue = 'yes' | 'no' | 'partial'

const ROWS: { feature: string; beacon: CellValue; sast: CellValue; manual: CellValue }[] = [
  { feature: 'Reviews code as it\u2019s written, not after', beacon: 'yes', sast: 'no', manual: 'no' },
  { feature: 'Understands agent-generated diffs', beacon: 'yes', sast: 'no', manual: 'partial' },
  { feature: 'Runs locally — zero repo access', beacon: 'yes', sast: 'partial', manual: 'yes' },
  { feature: 'Inline fix suggestions', beacon: 'yes', sast: 'no', manual: 'partial' },
  { feature: 'Works inside IDE, MCP, and CLI', beacon: 'yes', sast: 'no', manual: 'no' },
  { feature: 'No dashboards to configure', beacon: 'yes', sast: 'no', manual: 'yes' },
  { feature: 'Scales with agent-speed shipping', beacon: 'yes', sast: 'no', manual: 'no' },
]

function Cell({ value, isBeacon }: { value: CellValue; isBeacon?: boolean }) {
  if (value === 'yes')
    return <Check className={`mx-auto ${isBeacon ? 'h-5 w-5 text-dl-blue' : 'h-4 w-4 text-dl-muted'}`} />
  if (value === 'partial') return <span className="text-dl-muted">partial</span>
  return <Minus className="mx-auto h-4 w-4 text-dl-border" />
}

export function ComparisonTable() {
  return (
    <section id="compare" className="section-light px-6 py-[120px]">
      <div data-scroll-reveal className="mx-auto max-w-[900px]">
        <p className="section-kicker"><span className="kicker-index">06</span> Not another dashboard</p>
        <h2 className="mt-5 max-w-[560px] text-section-mobile font-medium text-dl-text lg:text-section">
          Built to work at the speed AI writes code.
        </h2>

        <div className="mt-12 overflow-hidden rounded-[14px] border border-dl-border/40">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-center text-[13px] text-dl-forest">
              <thead>
                <tr className="border-b border-dl-border bg-transparent">
                  <th className="px-4 py-3 text-left font-medium text-dl-text">Capability</th>
                  <th className="relative px-4 py-3 font-medium text-[#0b0a08]">
                    <div className="absolute inset-0 bg-dl-blue" />
                    <span className="relative z-10">Beacon</span>
                  </th>
                  <th className="px-4 py-3 font-medium text-dl-muted">Traditional SAST</th>
                  <th className="px-4 py-3 font-medium text-dl-muted">Manual review</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`transition-colors hover:bg-dl-blue/[0.04] ${i % 2 === 0 ? 'bg-transparent' : 'bg-dl-bg/20'}`}
                  >
                    <td className="px-4 py-3 text-left font-medium text-dl-forest">{row.feature}</td>
                    <td className="bg-dl-blue/[0.06] px-4 py-3">
                      <Cell value={row.beacon} isBeacon />
                    </td>
                    <td className="px-4 py-3">
                      <Cell value={row.sast} />
                    </td>
                    <td className="px-4 py-3">
                      <Cell value={row.manual} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-dl-muted/70">
          Categorical comparison — not a benchmark against any specific product.
        </p>
      </div>
    </section>
  )
}
