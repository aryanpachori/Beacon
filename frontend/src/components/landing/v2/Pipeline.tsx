'use client'

import { useEffect, useState } from 'react'
import { BeaconOrb } from './BeaconOrb'

const CHECKS = ['secret scan', 'injection shapes', 'authz paths', 'unsafe sinks']
const MCP_STATUS = ['reading diff', 'matching patterns', 'drafting fixes', 'returning patch']

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
        {/* Faulty input */}
        <div>
          <div className="bl-mono mb-3 flex items-center gap-[9px] text-[11px] uppercase tracking-[0.08em] text-[rgba(242,112,92,.9)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f2705c]" />
            agent output
          </div>
          <div className="overflow-hidden rounded-[13px] border border-[rgba(242,112,92,.28)] bg-[#0e1012] shadow-[0_20px_50px_rgba(0,0,0,.45)]">
            <div className="bl-mono flex border-b border-white/[0.06] px-3.5 py-[11px] text-[11px] text-[rgba(242,240,237,.45)]">
              <span>checkout.ts</span>
              <span className="ml-auto text-[rgba(242,112,92,.9)]">2 findings</span>
            </div>
            <div className="bl-mono py-3.5 text-[12.5px] leading-[2.2]">
              <div className="bg-[rgba(242,112,92,.12)] px-3.5 text-[rgba(242,240,237,.9)] shadow-[inset_2px_0_0_#f2705c]">
                const key = &quot;sk_live_51H8xJ2…&quot;
              </div>
              <div className="px-3.5 text-[rgba(242,240,237,.5)]">app.post(&quot;/refund&quot;, handler)</div>
            </div>
          </div>
        </div>

        {/* Danger rail */}
        <Rail
          line="linear-gradient(90deg,rgba(242,112,92,.1),rgba(242,112,92,.55))"
          chips={[
            { label: 'secret', top: 'calc(50% - 16px)', delay: '0s', tone: 'danger' },
            { label: 'sqli', top: 'calc(50% + 6px)', delay: '0.9s', tone: 'danger' },
            { label: 'authz', top: 'calc(50% - 34px)', delay: '1.75s', tone: 'danger' },
          ]}
        />

        {/* MCP center */}
        <div className="relative grid h-[290px] place-items-center">
          <div
            className="bl-orb-ring absolute rounded-full"
            style={{
              width: 210,
              height: 210,
              border: '1px solid rgba(220,47,47,.22)',
              animationDuration: '3.4s',
            }}
          />
          <div
            className="bl-orb-ring absolute rounded-full"
            style={{
              width: 210,
              height: 210,
              border: '1px solid rgba(220,47,47,.16)',
              animationDuration: '3.4s',
              animationDelay: '1.7s',
            }}
          />
          <div className="relative w-[250px] rounded-[18px] border border-[rgba(220,47,47,.42)] bg-[linear-gradient(180deg,rgba(220,47,47,.09),rgba(220,47,47,.02))] px-[18px] pb-4 pt-[18px] backdrop-blur-[2px]">
            <div className="mb-3.5 flex items-center gap-[9px]">
              <BeaconOrb size={16} core={7} duration={1.6} />
              <span className="text-[15px] font-semibold tracking-[-0.015em]">beacon mcp</span>
              <span className="bl-mono ml-auto text-[9.5px] tracking-[0.06em] text-[rgba(220,47,47,.9)]">
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
                      color: on ? '#dc2f2f' : 'rgba(242,240,237,.6)',
                    }}
                  >
                    <span
                      className="h-[5px] w-[5px] rounded-full"
                      style={{ background: on ? '#dc2f2f' : 'rgba(220,47,47,.35)' }}
                    />
                    {label}
                  </div>
                )
              })}
            </div>
            <div className="bl-mono mt-3.5 flex border-t border-[rgba(220,47,47,.2)] pt-3 text-[10px] text-[rgba(242,240,237,.5)]">
              <span>{MCP_STATUS[step]}</span>
              <span className="ml-auto">38ms</span>
            </div>
          </div>
        </div>

        {/* Success rail */}
        <Rail
          line="linear-gradient(90deg,rgba(111,211,154,.55),rgba(111,211,154,.12))"
          chips={[
            { label: 'env var', top: 'calc(50% - 30px)', delay: '0.35s', tone: 'success' },
            { label: 'params', top: 'calc(50% - 8px)', delay: '1.2s', tone: 'success' },
            { label: 'guard', top: 'calc(50% + 14px)', delay: '2s', tone: 'success' },
          ]}
        />

        {/* Clean output */}
        <div>
          <div className="bl-mono mb-3 flex items-center gap-[9px] text-[11px] uppercase tracking-[0.08em] text-[rgba(111,211,154,.9)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6fd39a]" />
            ready to commit
          </div>
          <div className="overflow-hidden rounded-[13px] border border-[rgba(111,211,154,.28)] bg-[#0e1012] shadow-[0_20px_50px_rgba(0,0,0,.45)]">
            <div className="bl-mono flex border-b border-white/[0.06] px-3.5 py-[11px] text-[11px] text-[rgba(242,240,237,.45)]">
              <span>checkout.ts</span>
              <span className="ml-auto text-[rgba(111,211,154,.9)]">clean</span>
            </div>
            <div className="bl-mono py-3.5 text-[12.5px] leading-[2.2]">
              <div className="bg-[rgba(111,211,154,.1)] px-3.5 text-[rgba(242,240,237,.9)] shadow-[inset_2px_0_0_#6fd39a]">
                const key = process.env.STRIPE_KEY
              </div>
              <div className="px-3.5 text-[rgba(242,240,237,.5)]">
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
            color: chip.tone === 'danger' ? '#f2705c' : '#6fd39a',
            background:
              chip.tone === 'danger' ? 'rgba(242,112,92,.16)' : 'rgba(111,211,154,.14)',
            borderColor:
              chip.tone === 'danger' ? 'rgba(242,112,92,.4)' : 'rgba(111,211,154,.4)',
          }}
        >
          {chip.label}
        </span>
      ))}
    </div>
  )
}
