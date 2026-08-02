'use client'

import { useEffect, useState } from 'react'
import { BeaconOrb } from './BeaconOrb'

const CHECKS = ['secret scan', 'injection shapes', 'authz paths', 'unsafe sinks']
const MCP_STATUS = ['reading diff', 'matching patterns', 'drafting fixes', 'returning patch']

const DANGER = '#c4675c'
const SUCCESS = '#6f9c82'

export function Pipeline({ demoSpeed = 1 }: { demoSpeed?: number }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % CHECKS.length), 1150 / demoSpeed)
    return () => clearInterval(id)
  }, [demoSpeed])

  return (
    <section id="how" data-reveal className="pb-[118px] pt-5">
      <p className="bl-kicker">The pipeline</p>
      <h2 className="bl-h2">Faulty code in. Reviewed code out.</h2>
      <p className="bl-lede mb-[60px] max-w-[56ch]">
        Your agent&apos;s diff streams through the Beacon MCP server on your machine. Findings come
        back as fixes, not tickets.
      </p>

      <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_118px_250px_118px_minmax(0,1fr)] lg:gap-0">
        <div>
          <div
            className="bl-mono mb-3 flex items-center gap-[9px] text-[11px] uppercase tracking-[0.08em]"
            style={{ color: 'rgba(196,103,92,.9)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: DANGER }} />
            agent output
          </div>
          <div
            className="overflow-hidden rounded-[13px] bg-white"
            style={{ border: '1px solid rgba(196,103,92,.3)' }}
          >
            <div className="bl-mono flex border-b border-black/[0.06] px-3.5 py-[11px] text-[11px] text-[rgba(8,9,10,.45)]">
              <span>checkout.ts</span>
              <span className="ml-auto" style={{ color: 'rgba(196,103,92,.9)' }}>
                2 findings
              </span>
            </div>
            <div className="bl-mono py-3.5 text-[12.5px] leading-[2.2]">
              <div
                className="px-3.5 text-[rgba(8,9,10,.9)]"
                style={{
                  background: 'rgba(196,103,92,.13)',
                  boxShadow: `inset 2px 0 0 ${DANGER}`,
                }}
              >
                const key = &quot;sk_live_51H8xJ2…&quot;
              </div>
              <div className="px-3.5 text-[rgba(8,9,10,.5)]">app.post(&quot;/refund&quot;, handler)</div>
            </div>
          </div>
        </div>

        <Rail
          line="linear-gradient(90deg,rgba(196,103,92,.12),rgba(196,103,92,.55))"
          chips={[
            { label: 'secret', top: 'calc(50% - 16px)', delay: '0s', tone: 'danger' },
            { label: 'sqli', top: 'calc(50% + 6px)', delay: '0.9s', tone: 'danger' },
            { label: 'authz', top: 'calc(50% - 34px)', delay: '1.75s', tone: 'danger' },
          ]}
        />

        <div className="relative grid h-[290px] place-items-center">
          <div className="relative w-[250px] rounded-[18px] border border-[rgba(8,9,10,.42)] bg-[linear-gradient(180deg,rgba(8,9,10,.09),rgba(8,9,10,.02))] px-[18px] pb-4 pt-[18px]">
            <div className="mb-3.5 flex items-center gap-[9px]">
              <BeaconOrb size={16} core={7} duration={1.6} />
              <span className="text-[15px] font-semibold tracking-[-0.015em]">beacon mcp</span>
              <span className="bl-mono ml-auto text-[9.5px] tracking-[0.06em] text-[rgba(8,9,10,.9)]">
                LOCAL
              </span>
            </div>
            <div className="flex flex-col gap-[7px]">
              {CHECKS.map((label, i) => {
                const on = i === step
                return (
                  <div
                    key={label}
                    className="bl-mono flex items-center gap-2 text-[11px] transition-[opacity,color] duration-[350ms] ease-out"
                    style={{
                      opacity: on ? 1 : 0.45,
                      color: on ? '#08090a' : 'rgba(8,9,10,.6)',
                    }}
                  >
                    <span
                      className="h-[5px] w-[5px] rounded-full"
                      style={{ background: on ? '#08090a' : 'rgba(8,9,10,.35)' }}
                    />
                    {label}
                  </div>
                )
              })}
            </div>
            <div className="bl-mono mt-3.5 flex border-t border-black/20 pt-3 text-[10px] text-[rgba(8,9,10,.5)]">
              <span>{MCP_STATUS[step]}</span>
              <span className="ml-auto">38ms</span>
            </div>
          </div>
        </div>

        <Rail
          line="linear-gradient(90deg,rgba(111,156,130,.55),rgba(111,156,130,.12))"
          chips={[
            { label: 'env var', top: 'calc(50% - 30px)', delay: '0.35s', tone: 'success' },
            { label: 'params', top: 'calc(50% - 8px)', delay: '1.2s', tone: 'success' },
            { label: 'guard', top: 'calc(50% + 14px)', delay: '2s', tone: 'success' },
          ]}
        />

        <div>
          <div className="bl-mono mb-3 flex items-center gap-[9px] text-[11px] uppercase tracking-[0.08em] text-[rgba(8,9,10,.9)]">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: SUCCESS }} />
            ready to commit
          </div>
          <div
            className="overflow-hidden rounded-[13px] bg-white"
            style={{ border: '1px solid rgba(111,156,130,.3)' }}
          >
            <div className="bl-mono flex border-b border-black/[0.06] px-3.5 py-[11px] text-[11px] text-[rgba(8,9,10,.45)]">
              <span>checkout.ts</span>
              <span className="ml-auto" style={{ color: 'rgba(111,156,130,.9)' }}>
                clean
              </span>
            </div>
            <div className="bl-mono py-3.5 text-[12.5px] leading-[2.2]">
              <div
                className="px-3.5 text-[rgba(8,9,10,.9)]"
                style={{
                  background: 'rgba(111,156,130,.12)',
                  boxShadow: `inset 2px 0 0 ${SUCCESS}`,
                }}
              >
                const key = process.env.STRIPE_KEY
              </div>
              <div className="px-3.5 text-[rgba(8,9,10,.5)]">
                app.post(&quot;/refund&quot;, requireOwner, handler)
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Rail({
  line,
  chips,
}: {
  line: string
  chips: { label: string; top: string; delay: string; tone: 'danger' | 'success' }[]
}) {
  return (
    <div className="relative hidden h-[150px] overflow-hidden lg:block">
      <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: line }} />
      {chips.map((chip) => (
        <span
          key={chip.label}
          className="bl-rail-chip bl-mono absolute left-0 whitespace-nowrap rounded-md border px-2 py-[3px] text-[9.5px]"
          style={{
            top: chip.top,
            animationDelay: chip.delay,
            color: chip.tone === 'danger' ? DANGER : SUCCESS,
            background:
              chip.tone === 'danger' ? 'rgba(196,103,92,.16)' : 'rgba(111,156,130,.15)',
            borderColor:
              chip.tone === 'danger' ? 'rgba(196,103,92,.4)' : 'rgba(111,156,130,.4)',
          }}
        >
          {chip.label}
        </span>
      ))}
    </div>
  )
}
