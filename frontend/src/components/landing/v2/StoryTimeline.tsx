'use client'

import { useEffect, useRef, useState } from 'react'

type Message = {
  id: number
  name: string
  role: string
  initials: string
  avatarBg: string
  avatarColor: string
  time: string
  text: string
  chip?: {
    border: string
    bg: string
    color: string
    text: string
  }
}

const MESSAGES: Message[] = [
  {
    id: 1,
    name: 'Beck Ostrander',
    role: 'CEO, Loopr',
    initials: 'BO',
    avatarBg: 'rgba(220,47,47,.16)',
    avatarColor: '#dc2f2f',
    time: '9:41 AM',
    text: 'just wire up stripe, we demo in an hour',
  },
  {
    id: 2,
    name: 'Jenna Cole',
    role: 'Staff Eng',
    initials: 'JC',
    avatarBg: 'rgba(111,211,154,.16)',
    avatarColor: '#6fd39a',
    time: '9:41 AM',
    text: 'an hour?? for a full checkout flow??',
  },
  {
    id: 3,
    name: 'Beck Ostrander',
    role: 'CEO, Loopr',
    initials: 'BO',
    avatarBg: 'rgba(220,47,47,.16)',
    avatarColor: '#dc2f2f',
    time: '9:41 AM',
    text: 'relax, cursor can knock this out in like 2 minutes',
  },
  {
    id: 4,
    name: 'cursor-agent',
    role: 'bot',
    initials: 'AI',
    avatarBg: 'rgba(143,167,255,.16)',
    avatarColor: '#8fa7ff',
    time: '9:41 AM',
    text: 'added checkout.ts to the branch',
    chip: {
      border: 'rgba(255,255,255,.13)',
      bg: 'rgba(255,255,255,.03)',
      color: 'rgba(242,240,237,.8)',
      text: '+240 −18 · 4 files changed\nconst key = "sk_live_51H8xJ2…"',
    },
  },
  {
    id: 5,
    name: 'Jenna Cole',
    role: 'Staff Eng',
    initials: 'JC',
    avatarBg: 'rgba(111,211,154,.16)',
    avatarColor: '#6fd39a',
    time: '9:41 AM',
    text: 'ok that actually worked. wait let me check something',
  },
  {
    id: 6,
    name: 'Beacon',
    role: 'bot',
    initials: '◆',
    avatarBg: 'rgba(220,47,47,.16)',
    avatarColor: '#dc2f2f',
    time: '9:41 AM',
    text: 'blocked before commit — this needs a look',
    chip: {
      border: 'rgba(242,112,92,.4)',
      bg: 'rgba(242,112,92,.09)',
      color: '#f2705c',
      text: 'CRITICAL  hardcoded secret · line 2',
    },
  },
  {
    id: 7,
    name: 'Jenna Cole',
    role: 'Staff Eng',
    initials: 'JC',
    avatarBg: 'rgba(111,211,154,.16)',
    avatarColor: '#6fd39a',
    time: '9:42 AM',
    text: 'oh no. OH NO. it hardcoded the live stripe key',
  },
  {
    id: 8,
    name: 'Jenna Cole',
    role: 'Staff Eng',
    initials: 'JC',
    avatarBg: 'rgba(111,211,154,.16)',
    avatarColor: '#6fd39a',
    time: '9:42 AM',
    text: 'ok, fixed, pushed. crisis averted. seen this one before.',
    chip: {
      border: 'rgba(111,211,154,.4)',
      bg: 'rgba(111,211,154,.08)',
      color: '#6fd39a',
      text: 'const key = process.env.STRIPE_KEY',
    },
  },
  {
    id: 9,
    name: 'Beck Ostrander',
    role: 'CEO, Loopr',
    initials: 'BO',
    avatarBg: 'rgba(220,47,47,.16)',
    avatarColor: '#dc2f2f',
    time: '9:44 AM',
    text: 'demo’d clean. calling it our robust security posture on the call',
  },
]

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
          await wait(700)
          if (cancelled) break
          setMsgCount(i + 1)
          setTypingIdx(-1)
          await wait(1150)
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

  return (
    <section data-reveal className="pb-[118px]">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_620px] lg:gap-14">
        <div>
          <p className="bl-kicker">Demo day at Loopr</p>
          <h2 className="bl-h2 max-w-[16ch]">How it actually plays out.</h2>
          <p className="bl-lede max-w-[42ch]">
            A founder who overpromised, an engineer who&apos;s seen this before, and one leaked key
            that never leaves the laptop — as it happened, in #loopr-eng.
          </p>
        </div>

        <div className="overflow-hidden rounded-[14px] border border-white/[0.09] bg-[#0e1012] shadow-[0_20px_50px_rgba(0,0,0,.4)]">
          <div className="flex items-center gap-2.5 border-b border-white/[0.07] px-5 py-3.5">
            <span className="bl-mono text-[13.5px] font-medium text-[rgba(242,240,237,.85)]">
              # loopr-eng
            </span>
            <span className="bl-mono ml-auto text-[11px] text-[rgba(242,240,237,.35)]">
              3 members · 1 bot
            </span>
          </div>

          <div
            ref={chatRef}
            className="flex h-[380px] flex-col gap-5 overflow-y-auto px-5 py-[22px]"
          >
            {messages.map((m) => (
              <div key={m.id} className="bl-msg-in flex gap-3">
                <div
                  className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg bl-mono text-[11.5px] font-semibold"
                  style={{ background: m.avatarBg, color: m.avatarColor }}
                >
                  {m.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className="text-sm font-semibold tracking-[-0.01em]">{m.name}</span>
                    <span className="text-[11px] text-[rgba(242,240,237,.35)]">{m.role}</span>
                    <span className="bl-mono ml-auto text-[10.5px] text-[rgba(242,240,237,.3)]">
                      {m.time}
                    </span>
                  </div>
                  <p className="m-0 text-[14.5px] leading-[1.5] text-[rgba(242,240,237,.82)]">
                    {m.text}
                  </p>
                  {m.chip && (
                    <div
                      className="bl-mono mt-[9px] inline-block whitespace-pre-wrap rounded-lg border px-[14px] py-[10px] text-[12.5px] leading-[1.6]"
                      style={{
                        borderColor: m.chip.border,
                        background: m.chip.bg,
                        color: m.chip.color,
                      }}
                    >
                      {m.chip.text}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {typingVisible && (
              <div className="flex items-center gap-3 opacity-65">
                <div className="h-[30px] w-[30px] shrink-0 rounded-lg bg-white/[0.05]" />
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] text-[rgba(242,240,237,.45)]">{typingName}</span>
                  <div className="flex gap-[3px]">
                    <span className="bl-typing-dot" />
                    <span className="bl-typing-dot" style={{ animationDelay: '.15s' }} />
                    <span className="bl-typing-dot" style={{ animationDelay: '.3s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
