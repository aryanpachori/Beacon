'use client'

import { useEffect, useState } from 'react'

const BEATS = [
  {
    n: '01',
    time: '09:41',
    short: 'The prompt',
    title: 'Maya ships a checkout endpoint.',
    snippet: '@cursor add a /checkout route with Stripe',
    caption: 'She is a product engineer, not a security engineer. She should not have to be one.',
  },
  {
    n: '02',
    time: '09:41',
    short: 'The agent',
    title: 'The agent writes 240 lines in 12 seconds.',
    snippet: '+240 −18  ·  4 files changed',
    caption: 'Working code. Also a live Stripe key, pasted straight into the handler.',
  },
  {
    n: '03',
    time: '09:41',
    short: 'The catch',
    title: 'Beacon flags it before the save lands.',
    snippet: 'CRITICAL  hardcoded secret · line 2',
    caption: 'No CI run, no scanner queue. The finding appears on the line that caused it.',
  },
  {
    n: '04',
    time: '09:42',
    short: 'The fix',
    title: 'One keystroke, and the risk is gone.',
    snippet: 'const key = process.env.STRIPE_KEY',
    caption: 'Beacon proposes the patch, Maya accepts it and keeps prompting. Nothing broke her flow.',
  },
  {
    n: '05',
    time: '09:44',
    short: 'The ship',
    title: 'PR #214 merges on time.',
    snippet: '✓ 0 findings  ·  reviewed locally',
    caption: 'The key never left her laptop, and the review never left the editor.',
  },
]

function chipStyle(i: number) {
  if (i === 2) {
    return {
      border: 'rgba(242,112,92,.4)',
      bg: 'rgba(242,112,92,.09)',
      color: '#f2705c',
    }
  }
  if (i >= 3) {
    return {
      border: 'rgba(111,211,154,.4)',
      bg: 'rgba(111,211,154,.08)',
      color: '#6fd39a',
    }
  }
  return {
    border: 'rgba(255,255,255,.13)',
    bg: 'rgba(255,255,255,.03)',
    color: 'rgba(242,240,237,.8)',
  }
}

export function StoryTimeline({ demoSpeed = 1 }: { demoSpeed?: number }) {
  const [beat, setBeat] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setBeat((b) => (b + 1) % BEATS.length), 3800 / demoSpeed)
    return () => clearInterval(id)
  }, [demoSpeed])

  const active = BEATS[beat]
  const chip = chipStyle(beat)

  return (
    <section data-reveal className="pb-[118px]">
      <p className="bl-kicker">A Tuesday afternoon</p>
      <h2 className="bl-h2">How it actually plays out.</h2>
      <p className="bl-lede mb-[46px] max-w-[52ch]">
        One prompt, one leaked key that never leaves the laptop, one PR merged on time.
      </p>

      <div className="relative min-h-[210px] overflow-hidden rounded-[18px] border border-white/[0.09] bg-[linear-gradient(160deg,rgba(255,255,255,.03),transparent)] px-6 py-8 md:px-11 md:py-10">
        <div className="bl-mono relative mb-3.5 text-[11px] tracking-[0.08em] text-[#ff6600]">
          {active.time} · {active.short}
        </div>
        <div className="relative mb-[18px] max-w-[26ch] text-[clamp(22px,2.8vw,28px)] font-semibold leading-[1.2] tracking-[-0.025em]">
          {active.title}
        </div>
        <div
          className="bl-mono relative inline-block rounded-[10px] border px-4 py-3 text-[13px]"
          style={{
            borderColor: chip.border,
            background: chip.bg,
            color: chip.color,
          }}
        >
          {active.snippet}
        </div>
        <p className="relative mt-[18px] mb-0 max-w-[46ch] text-[15.5px] leading-relaxed text-[rgba(242,240,237,.58)]">
          {active.caption}
        </p>
      </div>

      <div className="relative mt-9 flex items-start">
        <div className="absolute left-3.5 right-3.5 top-1.5 h-px bg-white/10" />
        {BEATS.map((b, i) => {
          const on = i === beat
          return (
            <div key={b.short} className="relative flex flex-1 flex-col items-center gap-2.5">
              <div
                className="h-[13px] w-[13px] rounded-full border-[3px] border-[#08090a] transition-[background,box-shadow] duration-400 ease-out"
                style={{
                  background: on ? '#ff6600' : '#2a2b2d',
                  boxShadow: on ? '0 0 0 4px rgba(255,102,0,.18)' : 'none',
                }}
              />
              <span
                className="text-center text-[12px] font-medium tracking-[-0.01em] transition-colors duration-400 ease-out md:text-[13.5px]"
                style={{ color: on ? '#ff6600' : 'rgba(242,240,237,.45)' }}
              >
                {b.short}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
