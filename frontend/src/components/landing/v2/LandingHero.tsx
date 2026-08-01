'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { BeaconOrb } from './BeaconOrb'

const WORDS = ['secrets', 'SQL injection', 'broken auth', 'leaked keys', 'unsafe redirects']
const KEY = 'sk_live_51H8xJ2eZvKYlo2C…'

const ORB = [
  { c: '#08090a', r: 'rgba(8,9,10,.5)', l: 'watching' },
  { c: '#08090a', r: 'rgba(8,9,10,.6)', l: 'reviewing' },
  { c: '#c4675c', r: 'rgba(196,103,92,.6)', l: '1 issue' },
  { c: '#6f9c82', r: 'rgba(111,156,130,.55)', l: 'clear' },
] as const

const STATUS = [
  'agent writing…',
  'scanning diff locally',
  'blocked before commit',
  'fixed inline · 38ms',
] as const

export function LandingHero({ demoSpeed = 1 }: { demoSpeed?: number }) {
  const [word, setWord] = useState(0)
  const [phase, setPhase] = useState(0)
  const [typed, setTyped] = useState('')

  useEffect(() => {
    const id = setInterval(() => setWord((w) => (w + 1) % WORDS.length), 2300)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let cancelled = false
    let timeout: ReturnType<typeof setTimeout>

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timeout = setTimeout(resolve, ms / demoSpeed)
      })

    const loop = async () => {
      while (!cancelled) {
        setPhase(0)
        setTyped('')
        for (let i = 1; i <= KEY.length && !cancelled; i += 2) {
          setTyped(KEY.slice(0, i))
          await wait(80)
        }
        if (cancelled) break
        setTyped(KEY)
        await wait(360)
        if (cancelled) break
        setPhase(1)
        await wait(900)
        if (cancelled) break
        setPhase(2)
        await wait(2600)
        if (cancelled) break
        setPhase(3)
        await wait(2100)
      }
    }

    loop()
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [demoSpeed])

  const orb = ORB[phase]
  const typing = phase === 0
  const scanning = phase === 1
  const risky = phase === 1 || phase === 2
  const flagged = phase === 2
  const fixed = phase === 3

  return (
    <header className="relative grid items-center gap-10 py-12 md:gap-14 md:py-16 lg:grid-cols-2 lg:gap-14 lg:py-16 lg:pb-24">
      <div className="relative">
        <div className="mb-[30px] inline-flex items-center gap-[9px] rounded-full border border-black/[0.11] py-1.5 pl-2.5 pr-3.5 text-[12.5px] text-[rgba(8,9,10,.7)]">
          <span className="bl-orb-core h-1.5 w-1.5 rounded-full bg-[#08090a]" />
          Local-first · zero repo access
        </div>

        <h1 className="mb-[22px] text-[clamp(40px,6.5vw,66px)] font-semibold leading-[1.02] tracking-[-0.035em]">
          Security that ships
          <br />
          at agent speed.
        </h1>

        <p className="mb-3.5 text-[clamp(18px,2.4vw,22px)] leading-[1.35] tracking-[-0.02em] text-[rgba(8,9,10,.9)]">
          Beacon catches{' '}
          <span
            key={word}
            className="bl-serif bl-word-in inline-block font-normal italic text-[#08090a]"
          >
            {WORDS[word]}
          </span>{' '}
          before commit.
        </p>

        <p className="mb-[34px] max-w-[44ch] text-[16.5px] leading-relaxed text-[rgba(8,9,10,.56)]">
          It rides along with Cursor, Claude Code and Copilot, reviewing every line the moment it&apos;s
          written — inside your editor, on your machine.
        </p>

        <div className="mb-[30px] flex flex-wrap items-center gap-3">
          <Link href="/register" className="bl-btn-primary">
            Install Beacon — free
          </Link>
          <a href="#how" className="bl-btn-ghost">
            See how it works →
          </a>
        </div>

        <div className="bl-mono flex flex-wrap gap-[22px] text-[11.5px] uppercase tracking-[0.04em] text-[rgba(8,9,10,.4)]">
          <span>IDE</span>
          <span>MCP</span>
          <span>CLI</span>
          <span>·</span>
          <span>&lt;40ms review</span>
        </div>
      </div>

      <div className="bl-float relative">
        <div className="relative overflow-hidden rounded-[14px] border border-black/[0.09] bg-[#ffffff]">
          <div className="flex items-center gap-3 border-b border-black/[0.07] px-4 py-[13px]">
            <span className="bl-mono text-xs text-[rgba(8,9,10,.55)]">routes/payments.ts</span>
            <div className="ml-auto flex items-center gap-2">
              <BeaconOrb size={16} core={7} color={orb.c} ring={orb.r} duration={1.8} />
              <span className="bl-mono text-[11px] tracking-[0.03em] text-[rgba(8,9,10,.55)]">
                {orb.l}
              </span>
            </div>
          </div>

          <div className="bl-mono relative px-0 pb-1 pt-[18px] text-[13px] leading-[2.05]">
            {scanning && (
              <div
                className="bl-scan pointer-events-none absolute inset-x-0 top-0 h-[34px]"
                style={{
                  background:
                    'linear-gradient(180deg,transparent,rgba(8,9,10,.13),transparent)',
                }}
              />
            )}

            <CodeLine n={1}>
              <span style={{ color: 'rgba(8,9,10,.85)' }}>export async function</span>{' '}
              <span style={{ color: 'rgba(8,9,10,.7)' }}>chargeCard</span>(req, res) {'{'}
            </CodeLine>

            {typing && (
              <CodeLine n={2} pad>
                <span style={{ color: 'rgba(8,9,10,.85)' }}>const</span> key ={' '}
                <span style={{ color: 'rgba(8,9,10,.6)' }}>&quot;{typed}</span>
                <span className="bl-caret inline-block h-[15px] w-[7px] translate-y-[-2px] bg-[#08090a] align-[-2px]" />
              </CodeLine>
            )}

            {risky && (
              <CodeLine
                n={2}
                pad
                className="bg-[rgba(196,103,92,.12)] shadow-[inset_2px_0_0_#c4675c]"
                numClass="text-[rgba(196,103,92,.8)]"
              >
                <span style={{ color: 'rgba(8,9,10,.85)' }}>const</span> key ={' '}
                <span style={{ color: 'rgba(8,9,10,.6)' }}>&quot;sk_live_51H8xJ2eZvKYlo2C…&quot;</span>
              </CodeLine>
            )}

            {fixed && (
              <CodeLine
                n={2}
                pad
                className="bg-[rgba(111,156,130,.11)] shadow-[inset_2px_0_0_#6f9c82]"
                numClass="text-[rgba(111,156,130,.85)]"
              >
                <span style={{ color: 'rgba(8,9,10,.85)' }}>const</span> key = process.env.
                <span style={{ color: 'rgba(8,9,10,.7)' }}>STRIPE_SECRET_KEY</span>
              </CodeLine>
            )}

            {flagged && (
              <div className="bl-annot mx-[18px] mb-3 ml-11 mt-2 rounded-[10px] border border-[rgba(196,103,92,.35)] bg-[rgba(196,103,92,.07)] p-[14px_15px] font-[family-name:var(--font-instrument-sans)]">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c4675c]" />
                  <span className="text-[12.5px] font-semibold tracking-[-0.01em]">
                    Hardcoded Stripe secret
                  </span>
                  <span className="bl-mono ml-auto text-[10.5px] tracking-[0.04em] text-[rgba(196,103,92,.9)]">
                    CRITICAL
                  </span>
                </div>
                <p className="mb-[11px] text-[13px] leading-normal text-[rgba(8,9,10,.62)]">
                  A live key would be committed to the repo. Read it from the environment instead.
                </p>
                <div className="flex gap-2">
                  <span className="bl-on-orange rounded-[7px] bg-[#08090a] px-3 py-[7px] text-[12.5px] font-medium text-[#f2f0ed]">
                    Accept fix
                  </span>
                  <span className="rounded-[7px] border border-black/[0.13] px-3 py-[7px] text-[12.5px] text-[rgba(8,9,10,.7)]">
                    Explain
                  </span>
                </div>
              </div>
            )}

            <CodeLine n={3} pad>
              <span style={{ color: 'rgba(8,9,10,.85)' }}>const</span> client ={' '}
              <span style={{ color: 'rgba(8,9,10,.85)' }}>new</span>{' '}
              <span style={{ color: 'rgba(8,9,10,.7)' }}>Stripe</span>(key)
            </CodeLine>
            <CodeLine n={4} pad>
              res.<span style={{ color: 'rgba(8,9,10,.7)' }}>json</span>(
              <span style={{ color: 'rgba(8,9,10,.85)' }}>await</span> client.charges.
              <span style={{ color: 'rgba(8,9,10,.7)' }}>create</span>(req.body))
            </CodeLine>
            <CodeLine n={5}>{'}'}</CodeLine>
          </div>

          <div className="bl-mono flex items-center gap-2.5 border-t border-black/[0.07] px-4 py-3 text-[11px] text-[rgba(8,9,10,.42)]">
            <span>{STATUS[phase]}</span>
            <span className="ml-auto">nothing left this machine</span>
          </div>
        </div>
      </div>
    </header>
  )
}

function CodeLine({
  n,
  children,
  pad,
  className = '',
  numClass = 'text-[rgba(8,9,10,.25)]',
}: {
  n: number
  children: ReactNode
  pad?: boolean
  className?: string
  numClass?: string
}) {
  return (
    <div className={`grid grid-cols-[44px_1fr] text-[rgba(8,9,10,.82)] ${className}`}>
      <span className={`pr-4 text-right ${numClass}`}>{n}</span>
      <span className={pad ? 'pl-[18px]' : undefined}>{children}</span>
    </div>
  )
}
