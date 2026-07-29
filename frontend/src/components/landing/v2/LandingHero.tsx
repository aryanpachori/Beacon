'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { BeaconOrb } from './BeaconOrb'

const WORDS = ['secrets', 'SQL injection', 'broken auth', 'leaked keys', 'unsafe redirects']
const KEY = 'sk_live_51H8xJ2eZvKYlo2C…'

const ORB = [
  { c: '#ff6600', r: 'rgba(255,102,0,.5)', l: 'watching' },
  { c: '#ff6600', r: 'rgba(255,102,0,.6)', l: 'reviewing' },
  { c: '#f2705c', r: 'rgba(242,112,92,.6)', l: '1 issue' },
  { c: '#6fd39a', r: 'rgba(111,211,154,.55)', l: 'clear' },
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
        <div className="mb-[30px] inline-flex items-center gap-[9px] rounded-full border border-white/[0.11] py-1.5 pl-2.5 pr-3.5 text-[12.5px] text-[rgba(242,240,237,.7)]">
          <span
            className="bl-orb-core h-1.5 w-1.5 rounded-full bg-[#6fd39a]"
            style={{ boxShadow: '0 0 10px rgba(111,211,154,.9)', animationDuration: '2s' }}
          />
          Local-first · zero repo access
        </div>

        <h1 className="mb-[22px] text-[clamp(40px,6.5vw,66px)] font-semibold leading-[1.02] tracking-[-0.035em]">
          Security that ships
          <br />
          at agent speed.
        </h1>

        <p className="mb-3.5 text-[clamp(18px,2.4vw,22px)] leading-[1.35] tracking-[-0.02em] text-[rgba(242,240,237,.9)]">
          Beacon catches{' '}
          <span
            key={word}
            className="bl-serif bl-word-in inline-block font-normal italic text-[#ff6600]"
          >
            {WORDS[word]}
          </span>{' '}
          before commit.
        </p>

        <p className="mb-[34px] max-w-[44ch] text-[16.5px] leading-relaxed text-[rgba(242,240,237,.56)]">
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

        <div className="bl-mono flex flex-wrap gap-[22px] text-[11.5px] uppercase tracking-[0.04em] text-[rgba(242,240,237,.4)]">
          <span>IDE</span>
          <span>MCP</span>
          <span>CLI</span>
          <span>·</span>
          <span>&lt;40ms review</span>
        </div>
      </div>

      <div className="bl-float relative">
        <div className="relative overflow-hidden rounded-[14px] border border-white/[0.09] bg-[#0e1012] shadow-[0_30px_80px_rgba(0,0,0,.6)]">
          <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-[13px]">
            <span className="bl-mono text-xs text-[rgba(242,240,237,.55)]">routes/payments.ts</span>
            <div className="ml-auto flex items-center gap-2">
              <BeaconOrb size={16} core={7} color={orb.c} ring={orb.r} duration={1.8} />
              <span className="bl-mono text-[11px] tracking-[0.03em] text-[rgba(242,240,237,.55)]">
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
                    'linear-gradient(180deg,transparent,rgba(255,102,0,.13),transparent)',
                }}
              />
            )}

            <CodeLine n={1}>
              <span style={{ color: '#8fa7ff' }}>export async function</span>{' '}
              <span style={{ color: '#ffd9a0' }}>chargeCard</span>(req, res) {'{'}
            </CodeLine>

            {typing && (
              <CodeLine n={2} pad>
                <span style={{ color: '#8fa7ff' }}>const</span> key ={' '}
                <span style={{ color: '#e3a978' }}>&quot;{typed}</span>
                <span className="bl-caret inline-block h-[15px] w-[7px] translate-y-[-2px] bg-[#ff6600] align-[-2px]" />
              </CodeLine>
            )}

            {risky && (
              <CodeLine
                n={2}
                pad
                className="bg-[rgba(242,112,92,.1)] shadow-[inset_2px_0_0_#f2705c]"
                numClass="text-[rgba(242,112,92,.75)]"
              >
                <span style={{ color: '#8fa7ff' }}>const</span> key ={' '}
                <span style={{ color: '#e3a978' }}>&quot;sk_live_51H8xJ2eZvKYlo2C…&quot;</span>
              </CodeLine>
            )}

            {fixed && (
              <CodeLine
                n={2}
                pad
                className="bg-[rgba(111,211,154,.09)] shadow-[inset_2px_0_0_#6fd39a]"
                numClass="text-[rgba(111,211,154,.8)]"
              >
                <span style={{ color: '#8fa7ff' }}>const</span> key = process.env.
                <span style={{ color: '#ffd9a0' }}>STRIPE_SECRET_KEY</span>
              </CodeLine>
            )}

            {flagged && (
              <div className="bl-annot mx-[18px] mb-3 ml-11 mt-2 rounded-[10px] border border-[rgba(242,112,92,.32)] bg-[rgba(242,112,92,.06)] p-[14px_15px] font-[family-name:var(--font-instrument-sans)]">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f2705c]" />
                  <span className="text-[12.5px] font-semibold tracking-[-0.01em]">
                    Hardcoded Stripe secret
                  </span>
                  <span className="bl-mono ml-auto text-[10.5px] tracking-[0.04em] text-[rgba(242,112,92,.85)]">
                    CRITICAL
                  </span>
                </div>
                <p className="mb-[11px] text-[13px] leading-normal text-[rgba(242,240,237,.62)]">
                  A live key would be committed to the repo. Read it from the environment instead.
                </p>
                <div className="flex gap-2">
                  <span className="bl-on-orange rounded-[7px] bg-[#ff6600] px-3 py-[7px] text-[12.5px] font-medium text-[#0b0a08]">
                    Accept fix
                  </span>
                  <span className="rounded-[7px] border border-white/[0.13] px-3 py-[7px] text-[12.5px] text-[rgba(242,240,237,.7)]">
                    Explain
                  </span>
                </div>
              </div>
            )}

            <CodeLine n={3} pad>
              <span style={{ color: '#8fa7ff' }}>const</span> client ={' '}
              <span style={{ color: '#8fa7ff' }}>new</span>{' '}
              <span style={{ color: '#ffd9a0' }}>Stripe</span>(key)
            </CodeLine>
            <CodeLine n={4} pad>
              res.<span style={{ color: '#ffd9a0' }}>json</span>(
              <span style={{ color: '#8fa7ff' }}>await</span> client.charges.
              <span style={{ color: '#ffd9a0' }}>create</span>(req.body))
            </CodeLine>
            <CodeLine n={5}>{'}'}</CodeLine>
          </div>

          <div className="bl-mono flex items-center gap-2.5 border-t border-white/[0.07] px-4 py-3 text-[11px] text-[rgba(242,240,237,.42)]">
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
  numClass = 'text-[rgba(242,240,237,.25)]',
}: {
  n: number
  children: ReactNode
  pad?: boolean
  className?: string
  numClass?: string
}) {
  return (
    <div className={`grid grid-cols-[44px_1fr] text-[rgba(242,240,237,.82)] ${className}`}>
      <span className={`pr-4 text-right ${numClass}`}>{n}</span>
      <span className={pad ? 'pl-[18px]' : undefined}>{children}</span>
    </div>
  )
}
