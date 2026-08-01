'use client'

import { useEffect, useRef, useState } from 'react'

type Tag = 'TEAM' | 'BEACON' | 'FIX'

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
  { id: 1, name: 'Gilfoyle', tag: 'TEAM', time: '2:14 AM', text: 'Beacon flagged clsx. Score of 21. Try to look concerned.', risk: 21, label: 'flagged' },
  { id: 2, name: 'Dinesh', tag: 'TEAM', time: '2:15 AM', text: 'Some of us sleep, Gilfoyle.', risk: 21, label: 'flagged' },
  { id: 3, name: 'Beacon', tag: 'BEACON', time: '2:16 AM', text: 'Blocked — clsx maintainer inactive 90+ days, no CVE response window', risk: 74, label: 'blocked' },
  { id: 4, name: 'Erlich', tag: 'TEAM', time: '7:42 AM', text: 'I found Beacon. You’re welcome, as usual.', risk: 74, label: 'blocked' },
  { id: 5, name: 'Richard', tag: 'TEAM', time: '7:44 AM', text: 'Are we getting sued. Just — are we.', risk: 70, label: 'contained' },
  { id: 6, name: 'Dinesh', tag: 'FIX', time: '7:51 AM', text: 'Patched · pinned and suppressed', risk: 22, label: 'patched' },
  { id: 7, name: 'Erlich', tag: 'TEAM', time: '8:11 AM', text: 'Pro plan approved. By me. You’re all lucky to know me.', risk: 8, label: 'resolved' },
]

const TAG_STYLE: Record<Tag, { bg: string; color: string }> = {
  TEAM: { bg: 'rgba(8,9,10,.08)', color: 'rgba(8,9,10,.65)' },
  BEACON: { bg: 'rgba(8,9,10,.16)', color: '#08090a' },
  FIX: { bg: 'rgba(8,9,10,.16)', color: '#08090a' },
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
  const current = msgCount === 0 ? { risk: 0, label: 'idle' } : MESSAGES[msgCount - 1]

  return (
    <section data-reveal className="pb-[118px]">
      <p className="bl-kicker">In the room</p>
      <h2 className="bl-h2 max-w-[16ch]">
        Every team has a Gilfoyle.
      </h2>
      <p className="bl-lede mb-[60px] max-w-[46ch]">
        Beacon just makes sure someone catches it before he does.
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_120px]">
        <div className="overflow-hidden rounded-[14px] border border-black/[0.09] bg-[#ffffff]">
          <div className="flex items-center gap-2.5 border-b border-black/[0.07] px-5 py-3.5">
            <span className="bl-mono text-[13.5px] font-medium text-[rgba(8,9,10,.85)]">
              #pied-piper-eng
            </span>
            <span className="bl-mono ml-auto text-[11px] text-[rgba(8,9,10,.35)]">
              4 members · 1 bot
            </span>
          </div>

          <div
            ref={chatRef}
            className="flex h-[380px] flex-col gap-5 overflow-y-auto px-5 py-[22px]"
          >
            {messages.map((m) => {
              const tag = TAG_STYLE[m.tag]
              return (
                <div key={m.id} className="bl-msg-in flex gap-3">
                  <div
                    className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg bl-mono text-[11px] font-semibold"
                    style={{ background: tag.bg, color: tag.color }}
                  >
                    {m.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-baseline gap-2">
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
              className="w-full rounded-full bg-[#08090a] transition-all duration-700 ease-out"
              style={{ height: `${current.risk}%` }}
            />
          </div>
          <span className="bl-mono mt-3 text-[22px] font-semibold text-[#08090a]">
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
