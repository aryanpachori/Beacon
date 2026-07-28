'use client'

import Link from 'next/link'
import { Terminal, GitBranch, Cpu } from 'lucide-react'
import { CodeIntelligenceDemo } from '@/components/landing/CodeIntelligenceDemo'

export function Hero() {
  return (
    <section data-scroll-hero className="relative min-h-screen overflow-hidden">
      <div className="ambient-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1180px] items-center px-6 py-28 lg:py-32">
        <div className="grid w-full grid-cols-1 gap-16 lg:grid-cols-[minmax(0,52%)_minmax(0,42%)] lg:items-center lg:gap-[6%]">
          <div data-scroll-hero-content className="will-change-transform">
            <p className="flex items-center gap-2 text-[13px] text-dl-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-dl-blue" />
              Your AI Security Engineer
            </p>
            <h1 className="mt-7 text-hero-mobile text-dl-navy lg:text-hero">
              Security that ships with <span className="font-serif italic font-normal text-dl-blue">AI</span>.
            </h1>
            <p className="mt-7 max-w-[460px] text-[16px] leading-relaxed text-dl-forest">
              Beacon lives inside your workflow — an IDE extension, an MCP server, a CLI —
              and quietly reviews every line your AI agents write. Local-first.
              Zero repo access. Nothing to configure.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link href="/register" className="btn-primary">
                Install Beacon — free
              </Link>
              <a href="#how-it-works" className="text-[13.5px] text-dl-forest underline decoration-dl-border/70 underline-offset-4 transition-colors hover:text-dl-navy hover:decoration-dl-muted">
                See it in action
              </a>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-7 gap-y-2 border-t border-dl-border/60 pt-6 text-xs text-dl-muted">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5" />
                IDE · MCP · CLI
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" />
                Runs entirely on your machine
              </span>
              <span className="flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5" />
                Never touches your repo
              </span>
            </div>
          </div>

          <div data-scroll-hero-visual className="will-change-transform">
            <CodeIntelligenceDemo />
          </div>
        </div>
      </div>
    </section>
  )
}
