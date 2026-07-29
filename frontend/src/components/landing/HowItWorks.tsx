'use client'

import { Check, Circle, Terminal, Sparkles, GitBranch } from 'lucide-react'

const SURFACES = [
  {
    label: 'IDE',
    caption: 'IDE: Beacon annotates risky lines the moment the agent writes them — live, in your editor.',
  },
  {
    label: 'MCP / CLI',
    caption: 'MCP & CLI: Your agent calls Beacon directly, or CI drops it in as a one-line step.',
  },
]

const AGENTS = ['Cursor', 'Claude Code', 'Copilot', 'Any MCP agent']

const PLUGINS = [
  'IDE extension',
  'MCP server',
  'CLI',
  'CI / GitHub Actions',
  'Cursor',
  'Claude Code',
  'Copilot',
  'VS Code',
  'Local-first',
  'Zero repo access',
]

const STEPS = [
  {
    index: '01',
    title: 'Add Beacon to your tools',
    copy: 'Install the IDE extension, connect the MCP server to your agent, or drop the CLI into CI. Under a minute, no config files.',
  },
  {
    index: '02',
    title: 'Keep working. Keep agenting.',
    copy: 'Beacon runs alongside Cursor, Claude Code, Copilot, or any MCP-compatible agent — watching diffs as they\u2019re written, not after.',
  },
  {
    index: '03',
    title: 'It reviews in real time, locally',
    copy: 'Every new line is checked against known vulnerability patterns, secrets, and unsafe logic — entirely on your machine. Nothing leaves it.',
  },
  {
    index: '04',
    title: 'Get an inline verdict, not a report',
    copy: 'Findings surface as annotations right where the risk is, with a suggested fix ready to accept. No dashboards to check later.',
  },
]

function IdeMock() {
  return (
    <div className="overflow-hidden rounded-[16px] border border-dl-border/50 bg-[#1A1610]/90 shadow-[0_24px_60px_-28px_rgba(20,17,12,0.7)]">
      <div className="flex items-center gap-2 border-b border-dl-border/40 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full border border-dl-border" />
          <span className="h-2 w-2 rounded-full border border-dl-border" />
          <span className="h-2 w-2 rounded-full border border-dl-border" />
        </div>
        <span className="ml-2 font-mono text-[11px] text-dl-muted">routes/payments.ts</span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-dl-blue">
          <span className="h-1.5 w-1.5 rounded-full bg-dl-blue" />
          beacon reviewing
        </span>
      </div>
      <div className="space-y-2.5 px-4 py-4 font-mono text-[12px] leading-relaxed">
        <p className="text-dl-muted/70">export async function chargeCard(req, res) {'{'}</p>
        <p className="rounded-md bg-[#A44636]/12 px-2 py-1 text-[#D08877] line-through decoration-[#D08877]/50">
          {'  '}const key = &quot;sk_live_51H8xJ2…&quot;
        </p>
        <p className="rounded-md bg-dl-blue/10 px-2 py-1 text-dl-blue">
          {'  '}const key = process.env.STRIPE_SECRET_KEY
        </p>
        <p className="text-dl-muted/70">{'}'}</p>
        <div className="mt-3 space-y-2 border-t border-dl-border/30 pt-3 text-[11.5px]">
          <div className="flex items-center gap-2 text-dl-blue">
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            Secret flagged inline
          </div>
          <div className="flex items-center gap-2 text-dl-blue">
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            Fix suggested — accept to apply
          </div>
          <div className="flex items-center gap-2 text-dl-muted">
            <Circle className="h-3.5 w-3.5" strokeWidth={2} />
            Watching next diff…
          </div>
        </div>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-dl-blue px-3 py-1.5 text-[11.5px] font-medium text-[#0b0a08]">
          <Sparkles className="h-3 w-3" />
          Hardcoded secret blocked
        </div>
      </div>
    </div>
  )
}

function McpMock() {
  return (
    <div className="overflow-hidden rounded-[16px] border border-dl-border/50 bg-[#0e1012]/95 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.7)]">
      <div className="grid grid-cols-[108px_1fr]">
        <aside className="border-r border-dl-border/30 bg-[#1A1610] px-3 py-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-dl-muted/70">Tools</p>
          <div className="mt-3 space-y-1.5 text-[12px]">
            <div className="rounded-md bg-[#f2f0ed]/90 px-2 py-1.5 font-medium text-[#08090a]">#beacon</div>
            <div className="px-2 py-1.5 text-dl-muted">#agent</div>
            <div className="px-2 py-1.5 text-dl-muted">#ci</div>
          </div>
        </aside>
        <div className="space-y-4 px-4 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#A44636]/25 text-[10px] font-bold text-[#D08877]">
                A
              </span>
              <span className="text-[12px] font-medium text-dl-text">Agent</span>
            </div>
            <p className="mt-2 rounded-xl bg-dl-surface/40 px-3 py-2 text-[12.5px] leading-relaxed text-dl-forest">
              @Beacon review this diff before I stage it — payments route.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-dl-blue/20 text-dl-blue">
                <Sparkles className="h-3 w-3" />
              </span>
              <span className="text-[12px] font-medium text-dl-text">Beacon</span>
            </div>
            <div className="mt-2 space-y-2">
              <p className="rounded-xl bg-dl-blue/10 px-3 py-2 text-[12.5px] leading-relaxed text-dl-forest">
                On it. Reviewing locally in <span className="font-mono text-dl-blue">routes/payments.ts</span>…
              </p>
              <p className="rounded-xl border border-dl-blue/25 bg-dl-blue/10 px-3 py-2 text-[12.5px] leading-relaxed text-dl-text">
                Done. Flagged hardcoded secret. Suggested fix ready — nothing left your machine.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-dl-border/50 px-3 py-1.5 text-[11px] text-dl-muted">
            <Terminal className="h-3 w-3 text-dl-blue" />
            MCP · local review · 0ms cloud
          </div>
        </div>
      </div>
    </div>
  )
}

function FlowConnector() {
  return (
    <div className="relative mx-auto hidden h-16 w-full max-w-[720px] lg:block" aria-hidden>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 720 64" fill="none" preserveAspectRatio="none">
        <path
          d="M180 0 C180 28, 360 28, 360 64"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeDasharray="4 5"
          className="text-dl-border"
        />
        <path
          d="M540 0 C540 28, 360 28, 360 64"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeDasharray="4 5"
          className="text-dl-border"
        />
      </svg>
    </div>
  )
}

export function HowItWorks() {
  return (
    <section id="how-it-works" data-scroll-reveal className="px-6 py-[120px]">
      <div className="mx-auto max-w-[1100px]">
        <p className="section-kicker justify-center text-center">
          <span className="kicker-index">03</span> How it works
        </p>
        <h2 className="mx-auto mt-5 max-w-[720px] text-center text-section-mobile font-medium text-dl-text lg:text-section">
          Run Beacon from wherever you write code.
        </h2>
        <p className="mx-auto mt-5 max-w-[540px] text-center text-[15px] leading-relaxed text-dl-muted">
          Start from your IDE, MCP agent, or CLI. Either way, Beacon shows up with local review
          already plugged in — no dashboards, no repo access.
        </p>

        {/* Surface mockups */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <div>
            <IdeMock />
            <p className="mt-4 text-center text-[13px] leading-relaxed text-dl-muted">
              {SURFACES[0].caption}
            </p>
          </div>
          <div>
            <McpMock />
            <p className="mt-4 text-center text-[13px] leading-relaxed text-dl-muted">
              {SURFACES[1].caption}
            </p>
          </div>
        </div>

        <FlowConnector />
        <div className="mx-auto my-6 h-10 w-px border-l border-dashed border-dl-border lg:hidden" aria-hidden />

        {/* Agent hub */}
        <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-dl-border/50 bg-[#1A1610]/80 px-4 py-3 shadow-[0_12px_40px_-20px_rgba(20,17,12,0.8)]">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-dl-blue text-[#0b0a08]">
            <GitBranch className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[14px] font-medium text-dl-text">Your agents</p>
            <p className="text-[12px] text-dl-muted">{AGENTS.join(' · ')}</p>
          </div>
        </div>

        <div className="mx-auto my-2 h-12 w-px border-l border-dashed border-dl-border" aria-hidden />

        {/* Integrations + steps */}
        <div className="text-center">
          <h3 className="font-serif text-[28px] font-medium italic leading-tight text-dl-navy md:text-[34px]">
            One install. Every agent gets Beacon.
          </h3>
          <div className="mx-auto mt-8 flex max-w-[820px] flex-wrap items-center justify-center gap-2.5">
            {PLUGINS.map((name) => (
              <span
                key={name}
                className="inline-flex items-center rounded-full border border-dl-border/45 bg-[#1A1610]/55 px-3.5 py-1.5 text-[12.5px] text-dl-forest"
              >
                {name}
              </span>
            ))}
            <span className="inline-flex items-center rounded-full bg-dl-blue px-3.5 py-1.5 text-[12.5px] font-medium text-[#0b0a08]">
              Local-first review
            </span>
          </div>
          <p className="mx-auto mt-6 max-w-[460px] text-[13.5px] leading-relaxed text-dl-muted">
            Connect Beacon once. Every agent run gets inline review automatically — no per-run setup.
          </p>
        </div>

        {/* Four steps as compact workflow rail */}
        <div className="mt-16 grid grid-cols-1 gap-8 border-t border-dl-border/30 pt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((step) => (
            <div key={step.index}>
              <span className="font-serif text-[22px] italic text-dl-blue">{step.index}</span>
              <h4 className="mt-3 text-[15px] font-medium leading-snug text-dl-text">{step.title}</h4>
              <p className="mt-2 text-[13px] leading-relaxed text-dl-muted">{step.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
