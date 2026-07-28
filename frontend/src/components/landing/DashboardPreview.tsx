'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion'

type Severity = 'critical' | 'high' | 'medium'
type Status = 'fixed' | 'reviewing' | 'flagged'

type Row = {
  finding: string
  repo: string
  severity: Severity
  status: Status
}

const ROWS: Row[] = [
  { finding: 'Hardcoded API key', repo: 'payments-api', severity: 'critical', status: 'fixed' },
  { finding: 'SQL injection via interpolation', repo: 'checkout-service', severity: 'critical', status: 'fixed' },
  { finding: 'Missing authorization check', repo: 'admin-panel', severity: 'high', status: 'reviewing' },
  { finding: 'Unvalidated redirect', repo: 'marketing-site', severity: 'medium', status: 'fixed' },
  { finding: 'Insecure deserialization', repo: 'worker-queue', severity: 'high', status: 'flagged' },
  { finding: 'Weak session expiry', repo: 'auth-service', severity: 'medium', status: 'fixed' },
]

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: 'text-[#D08877]',
  high: 'text-[#D1A276]',
  medium: 'text-[#D0C08A]',
}

const STATUS_CHIP: Record<Status, { label: string; className: string }> = {
  fixed: { label: 'Fixed', className: 'bg-dl-blue/15 text-dl-blue border-dl-blue/25' },
  reviewing: { label: 'Reviewing', className: 'bg-dl-surface text-dl-muted border-dl-border' },
  flagged: { label: 'Flagged', className: 'bg-[#D08877]/12 text-[#D08877] border-[#D08877]/25' },
}

export function DashboardPreview() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  })
  const rotateX = useTransform(scrollYProgress, [0, 1], [4, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [0.96, 1])
  const shadowOpacity = useTransform(scrollYProgress, [0, 1], [0.1, 0.24])
  const boxShadow = useMotionTemplate`0 20px 60px -20px rgba(20,17,11, ${shadowOpacity})`

  return (
    <section ref={sectionRef} className="section-dark px-6 py-[120px]">
      <div className="mx-auto max-w-[1200px] text-center" data-scroll-reveal>
        <p className="section-kicker justify-center"><span className="kicker-index">05</span> Visibility when you want it</p>
        <h2 className="mx-auto mt-5 max-w-[600px] text-section-mobile font-medium text-dl-text lg:text-section">
          Every finding, across every repo — one quiet feed.
        </h2>
        <p className="mx-auto mt-5 max-w-[520px] text-[15px] leading-relaxed text-dl-muted">
          Beacon works inline by default. When you do want the bird&apos;s-eye view, every catch
          across your team surfaces here — what was found, where, and whether it shipped fixed.
        </p>

        <motion.div
          style={{ rotateX, scale, transformPerspective: 1200, boxShadow }}
          className="glass-panel mx-auto mt-14 w-full max-w-[860px] p-6"
        >
          <motion.div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium text-dl-text">Team findings</span>
            <span className="text-xs text-dl-muted">Sample view</span>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-dl-border text-[11px] uppercase tracking-wide text-dl-muted">
                  <th className="pb-3 font-medium">Finding</th>
                  <th className="pb-3 font-medium">Repo</th>
                  <th className="pb-3 font-medium">Severity</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.finding} className="border-b border-dl-border/60 transition-colors hover:bg-dl-surface/60">
                    <td className="py-3 font-medium text-dl-text">{row.finding}</td>
                    <td className="py-3 font-mono text-[12px] text-dl-muted">{row.repo}</td>
                    <td className={`py-3 font-medium capitalize ${SEVERITY_COLOR[row.severity]}`}>{row.severity}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${STATUS_CHIP[row.status].className}`}>
                        {STATUS_CHIP[row.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
