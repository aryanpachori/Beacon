'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

type Line = { code: string; risk?: string; fix?: string }

type Scenario = {
  file: string
  lines: Line[]
  riskLine: number
  finding: string
  detail: string
}

const SCENARIOS: Scenario[] = [
  {
    file: 'routes/payments.ts',
    lines: [
      { code: 'export async function chargeCard(req, res) {' },
      { code: '  const key = "sk_live_51H8xJ2eZvKYlo2C…"', risk: 'hardcoded-secret', fix: '  const key = process.env.STRIPE_SECRET_KEY' },
      { code: '  const client = new Stripe(key)' },
      { code: '  const result = await client.charges.create(req.body)' },
      { code: '  res.json(result)' },
      { code: '}' },
    ],
    riskLine: 1,
    finding: 'Hardcoded secret key',
    detail: 'Beacon caught a live API key committed in plaintext — before it reached the PR.',
  },
  {
    file: 'db/queries.ts',
    lines: [
      { code: 'export function findUser(email) {' },
      { code: '  const q = `SELECT * FROM users WHERE email = \'${email}\'`', risk: 'sql-injection', fix: '  const q = \'SELECT * FROM users WHERE email = $1\'' },
      { code: '  return db.query(q)' },
      { code: '}' },
    ],
    riskLine: 1,
    finding: 'SQL injection via string interpolation',
    detail: 'The AI agent concatenated raw input into a query. Beacon flagged it inline, instantly.',
  },
  {
    file: 'api/admin/users.ts',
    lines: [
      { code: 'router.delete("/users/:id", async (req, res) => {' },
      { code: '  await db.users.delete(req.params.id)', risk: 'missing-auth', fix: '  requireRole(req, "admin")\n  await db.users.delete(req.params.id)' },
      { code: '  res.sendStatus(204)' },
      { code: '})' },
    ],
    riskLine: 1,
    finding: 'Missing authorization check',
    detail: 'A destructive route shipped with no role check. Beacon noticed what review missed.',
  },
]

const STAGE_DURATION = 4200

export function CodeIntelligenceDemo() {
  const [index, setIndex] = useState(0)
  const [stage, setStage] = useState<'writing' | 'flagged' | 'fixed'>('writing')

  useEffect(() => {
    setStage('writing')
    const t1 = setTimeout(() => setStage('flagged'), 900)
    const t2 = setTimeout(() => setStage('fixed'), 2400)
    const t3 = setTimeout(() => setIndex((i) => (i + 1) % SCENARIOS.length), STAGE_DURATION)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [index])

  const scenario = SCENARIOS[index]

  return (
    <div className="glass-panel relative overflow-hidden p-0">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-dl-border px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full border border-dl-border" />
          <span className="h-2 w-2 rounded-full border border-dl-border" />
          <span className="h-2 w-2 rounded-full border border-dl-border" />
        </div>
        <span className="ml-2 font-mono text-[11px] text-dl-muted">{scenario.file}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full transition-colors ${stage === 'writing' ? 'bg-dl-border' : 'bg-dl-blue'}`} />
          <span className="font-mono text-[10px] uppercase tracking-wide text-dl-muted">
            {stage === 'writing' ? 'agent writing…' : stage === 'flagged' ? 'beacon reviewing' : 'secured'}
          </span>
        </div>
      </div>

      {/* Code body */}
      <div className="relative px-5 py-5 font-mono text-[12.5px] leading-[1.9]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {scenario.lines.map((line, i) => {
              const isRisk = i === scenario.riskLine
              const showFix = isRisk && stage === 'fixed' && line.fix

              return (
                <div key={i} className="group relative flex items-start gap-3">
                  <span className="w-4 shrink-0 select-none text-right text-dl-muted/50">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    {!showFix ? (
                      <span
                        className={
                          isRisk && stage !== 'writing'
                            ? 'rounded px-1 -mx-1 text-[#A44636] transition-colors' + (stage === 'flagged' ? ' bg-[#A44636]/[0.09]' : ' line-through opacity-40')
                            : 'text-dl-forest'
                        }
                      >
                        {line.code}
                      </span>
                    ) : (
                      <motion.span
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="whitespace-pre rounded bg-dl-blue-pale px-1 -mx-1 text-dl-blue"
                      >
                        {line.fix}
                      </motion.span>
                    )}
                  </div>

                  {/* Inline annotation */}
                  {isRisk && stage === 'flagged' && (
                    <motion.div
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute left-full top-0 ml-3 hidden w-max max-w-[220px] rounded-lg border border-[#A44636]/25 bg-[#FBF0EC] px-2.5 py-1.5 text-[10.5px] leading-snug text-[#7E3626] shadow-sm sm:block"
                    >
                      {scenario.finding}
                    </motion.div>
                  )}
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Status footer */}
      <div className="flex items-center gap-2.5 border-t border-dl-border px-5 py-3.5">
        <AnimatePresence mode="wait">
          {stage === 'fixed' ? (
            <motion.div
              key="fixed"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-[12px] text-dl-blue"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-medium">Fixed before it shipped</span>
              <span className="text-dl-muted">— {scenario.detail}</span>
            </motion.div>
          ) : (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-[12px] text-dl-muted"
            >
              <span className="h-2 w-2 rounded-full bg-dl-blue" />
              Beacon is reviewing this diff in real time
            </motion.div>
          )}
        </AnimatePresence>

        <div className="ml-auto flex gap-1.5">
          {SCENARIOS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show example ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-dl-blue' : 'w-1.5 bg-dl-border hover:bg-dl-muted'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
