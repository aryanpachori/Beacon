'use client'

import { useEffect, useRef, useState } from 'react'

type Tag = 'HUMAN' | 'AGENT' | 'BEACON' | 'FIX'

type Message = {
  id: number
  name: string
  tag: Tag
  time: string
  text: string
  risk: number
  label: string
}

const MESSAGES: Message[] = [
  {
    id: 1,
    name: 'Richard Hendricks',
    tag: 'HUMAN',
    time: '2:11 AM',
    text: 'we need checkout working before the Hooli demo. just… please don’t hardcode anything',
    risk: 8,
    label: 'nominal',
  },
  {
    id: 2,
    name: 'Erlich Bachman',
    tag: 'HUMAN',
    time: '2:12 AM',
    text: 'Cursor will crush this. I discovered AI coding. You’re welcome.',
    risk: 12,
    label: 'forming',
  },
  {
    id: 3,
    name: 'Gilfoyle',
    tag: 'HUMAN',
    time: '2:12 AM',
    text: 'This is going to be a disaster. I’ll watch.',
    risk: 18,
    label: 'forming',
  },
  {
    id: 4,
    name: 'cursor-agent',
    tag: 'AGENT',
    time: '2:14 AM',
    text: 'wrote checkout.ts · +240 −18, 4 files changed',
    risk: 42,
    label: 'building',
  },
  {
    id: 5,
    name: 'Jared Dunn',
    tag: 'HUMAN',
    time: '2:14 AM',
    text: 'it compiled. I’m choosing to feel proud of us as a family.',
    risk: 48,
    label: 'building',
  },
  {
    id: 6,
    name: 'Beacon',
    tag: 'BEACON',
    time: '2:15 AM',
    text: 'blocked commit — critical: hardcoded Stripe live key, line 2',
    risk: 94,
    label: 'critical',
  },
  {
    id: 7,
    name: 'Jian-Yang',
    tag: 'HUMAN',
    time: '2:15 AM',
    text: 'this is bad. very bad. like my see-food app.',
    risk: 90,
    label: 'critical',
  },
  {
    id: 8,
    name: 'Gilfoyle',
    tag: 'FIX',
    time: '2:18 AM',
    text: 'patched · moved key to process.env.STRIPE_KEY. You’re welcome. Don’t thank me.',
    risk: 22,
    label: 'containing',
  },
  {
    id: 9,
    name: 'Richard Hendricks',
    tag: 'HUMAN',
    time: '2:20 AM',
    text: 'demo’s clean. we don’t talk about the key. ever.',
    risk: 4,
    label: 'resolved',
  },
  {
    id: 10,
    name: 'Jian-Yang',
    tag: 'HUMAN',
    time: '2:20 AM',
    text: 'yes',
    risk: 3,
    label: 'resolved',
  },
]

const TAG_STYLE: Record<Tag, { bg: string; color: string }> = {
  HUMAN: { bg: 'rgba(8,9,10,.08)', color: 'rgba(8,9,10,.65)' },
  AGENT: { bg: 'rgba(8,9,10,.16)', color: 'rgba(8,9,10,.85)' },
  BEACON: { bg: 'rgba(8,9,10,.16)', color: '#08090a' },
  FIX: { bg: 'rgba(8,9,10,.16)', color: '#08090a' },
}

function riskColor(risk: number) {
  if (risk >= 65) return '#c4675c'
  if (risk >= 30) return '#08090a'
  return '#6f9c82'
}

function initials(name: string) {
  if (name === 'cursor-agent') return 'CA'
  if (name === 'Beacon') return 'BE'
  if (name === 'Gilfoyle') return 'GI'
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function StoryTimeline({ demoSpeed = 1 }: { demoSpeed?: number }) {
  const [msgCount, setMsgCount] = useState(0)
  const [typingIdx, setTypingIdx] = useState(-1)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = chatRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgCount, typingIdx])

  useEffect(() => {
    let cancelled = false
    let timeout: ReturnType<typeof setTimeout> | null = null

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timeout = setTimeout(resolve, ms / demoSpeed)
      })

    const loop = async () => {
      while (!cancelled) {
        setMsgCount(0)
        setTypingIdx(-1)
        await wait(700)

        for (let i = 0; i < MESSAGES.length && !cancelled; i += 1) {
          setTypingIdx(i)
          await wait(650)
          if (cancelled) break
          setMsgCount(i + 1)
          setTypingIdx(-1)
          await wait(1050)
        }

        if (cancelled) break
        await wait(3200)
      }
    }

    loop()
    return () => {
      cancelled = true
      if (timeout) clearTimeout(timeout)
    }
  }, [demoSpeed])

  const messages = MESSAGES.slice(0, msgCount)
  const typingVisible = typingIdx > -1
  const typingName = typingVisible ? MESSAGES[typingIdx].name : ''
  const current = msgCount === 0 ? { risk: 0, label: 'idle' } : MESSAGES[msgCount - 1]
  const barColor = riskColor(current.risk)

  return (
    <section data-reveal className="pb-[118px]">
      <p className="bl-kicker">In the room</p>
      <h2 className="bl-h2 max-w-[18ch]">Every team has a Gilfoyle.</h2>
      <p className="bl-lede mb-[60px] max-w-[52ch]">
        Pied Piper almost ships a live Stripe key to demo day. Beacon catches it before Erlich can
        take credit.
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_120px]">
        <div className="overflow-hidden rounded-[14px] border border-black/[0.09] bg-[#ffffff]">
          <div className="flex items-center gap-2.5 border-b border-black/[0.07] px-5 py-3.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#08090a]" />
            <span className="bl-mono text-[13.5px] font-medium text-[rgba(8,9,10,.85)]">
              #pied-piper-eng
            </span>
            <span className="bl-mono ml-auto text-[11px] text-[rgba(8,9,10,.35)]">
              5 humans · 1 agent · 1 bot
            </span>
          </div>

          <div
            ref={chatRef}
            className="flex h-[420px] flex-col gap-5 overflow-y-auto px-5 py-[22px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {messages.map((m) => {
              const tag = TAG_STYLE[m.tag]
              return (
                <div key={m.id} className="bl-msg-in flex gap-3">
                  <div
                    className="bl-mono grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg text-[11px] font-semibold"
                    style={{ background: tag.bg, color: tag.color }}
                  >
                    {initials(m.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-semibold tracking-[-0.01em]">{m.name}</span>
                      <span
                        className="bl-mono rounded px-1.5 py-[1px] text-[9.5px] font-semibold tracking-[0.04em]"
                        style={{ background: tag.bg, color: tag.color }}
                      >
                        {m.tag}
                      </span>
                      <span className="bl-mono ml-auto text-[10.5px] text-[rgba(8,9,10,.3)]">
                        {m.time}
                      </span>
                    </div>
                    <p className="m-0 text-[14.5px] leading-[1.5] text-[rgba(8,9,10,.82)]">
                      {m.text}
                    </p>
                  </div>
                </div>
              )
            })}

            {typingVisible && (
              <div className="flex items-center gap-3 opacity-65">
                <div className="h-[30px] w-[30px] shrink-0 rounded-lg bg-black/[0.05]" />
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] text-[rgba(8,9,10,.45)]">{typingName}</span>
                  <div className="flex gap-[3px]">
                    <span className="bl-typing-dot" style={{ animationDelay: '0s' }} />
                    <span className="bl-typing-dot" style={{ animationDelay: '0.15s' }} />
                    <span className="bl-typing-dot" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-[14px] border border-black/[0.09] bg-[#ffffff] px-4 py-6">
          <span className="bl-mono mb-3 text-[10px] uppercase tracking-[0.08em] text-[rgba(8,9,10,.4)]">
            Risk level
          </span>
          <div className="relative flex h-[140px] w-3 items-end overflow-hidden rounded-full bg-black/[0.06]">
            <div
              className="w-full rounded-full transition-all duration-700 ease-out"
              style={{ height: `${current.risk}%`, background: barColor }}
            />
          </div>
          <span className="bl-mono mt-3 text-[22px] font-semibold" style={{ color: barColor }}>
            {current.risk}
          </span>
          <span className="bl-mono text-[11px] capitalize text-[rgba(8,9,10,.5)]">
            {current.label}
          </span>
        </div>
      </div>
    </section>
  )
}
