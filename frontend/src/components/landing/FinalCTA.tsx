'use client'

import Link from 'next/link'
import { Cpu, GitBranch, Terminal } from 'lucide-react'

export function FinalCTA() {
  return (
    <section data-scroll-cta className="section-dark px-6 py-[140px]">
      <div
        data-scroll-cta-inner
        className="mx-auto max-w-[720px] text-center"
      >
        <h2 className="text-[34px] font-medium leading-[1.15] text-dl-text md:text-[42px]">
          Let your AI ship faster.<br /> Let <span className="font-serif italic font-normal text-dl-blue">Beacon</span> watch.
        </h2>
        <p className="mx-auto mt-6 max-w-[420px] text-[15px] leading-relaxed text-dl-muted">
          Free to install. No repo access required. Live in your editor in under a minute.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register" className="btn-primary">
            Install Beacon — free
          </Link>
          <a href="mailto:hello@beaconapp.dev" className="text-[13.5px] text-dl-muted underline decoration-dl-border underline-offset-4 transition-colors hover:text-dl-text hover:decoration-dl-muted">
            Talk to us
          </a>
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 border-t border-dl-border pt-6 text-xs text-dl-muted">
          <span className="flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5" />
            IDE · MCP · CLI
          </span>
          <span className="flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5" />
            Local-first
          </span>
          <span className="flex items-center gap-1.5">
            <GitBranch className="h-3.5 w-3.5" />
            Zero repo access
          </span>
        </div>
      </div>
    </section>
  )
}
