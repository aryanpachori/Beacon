'use client'

import { useState } from 'react'

const FEATURES = [
  {
    n: '01',
    tag: 'inline',
    title: 'Real-time inline review',
    body: 'Risky lines are annotated the moment an agent writes them — not in CI, not in a report.',
    snippet: `// annotated the instant it's written\nconst key = "sk_live_51H8xJ2…"\n                              ↑ flagged`,
  },
  {
    n: '02',
    tag: 'integrations',
    title: 'IDE, MCP and CLI',
    body: 'A native editor extension, an MCP server your agent calls, or a step in your pipeline.',
    snippet: `$ beacon mcp --serve\n> listening on stdio\n> 3 agents connected`,
  },
  {
    n: '03',
    tag: 'local',
    title: 'Local-first, always',
    body: 'Analysis runs on your machine. Beacon has zero repo access by design.',
    snippet: `repo access   none\nnetwork out   0 req\nanalysis      on-device`,
  },
  {
    n: '04',
    tag: 'infra',
    title: 'Infra & config scanning',
    body: 'Terraform, Docker and nginx configs checked for open security groups, missing TLS, and disabled RLS.',
    snippet: `CRITICAL  0.0.0.0/0 on port 5432\nfile: main.tf:42`,
  },
  {
    n: '05',
    tag: 'deploy-gate',
    title: 'Blocks the deploy, not just the PR',
    body: 'A pre-deploy check that fails the pipeline when critical findings exist — before it ships.',
    snippet: `$ beacon gate\n✗ 1 critical finding — deploy blocked`,
  },
  {
    n: '06',
    tag: 'supply-chain',
    title: 'Catches AI-hallucinated packages',
    body: 'Slopsquatting detection flags typosquatted or hallucinated dependency names before install.',
    snippet: `WARNING  package not found on npm\n"reqeusts-http" · did agent hallucinate this?`,
  },
]

export function Features() {
  const [feature, setFeature] = useState(0)
  const active = FEATURES[feature]

  return (
    <section id="features" data-reveal className="pb-[110px]">
      <p className="bl-kicker">Features</p>
      <h2 className="bl-h2 mb-2">Everything it takes to trust AI-written code.</h2>

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_380px] lg:gap-[70px]">
        <div>
          {FEATURES.map((f, i) => {
            const on = i === feature
            return (
              <div
                key={f.n}
                onMouseEnter={() => setFeature(i)}
                onFocus={() => setFeature(i)}
                tabIndex={0}
                className="grid cursor-default grid-cols-[44px_1fr] gap-[22px] border-t border-white/[0.09] py-[27px] outline-none"
              >
                <span
                  className="bl-mono pt-[3px] text-[13px] transition-colors duration-300"
                  style={{ color: on ? '#ff6600' : 'rgba(242,240,237,.35)' }}
                >
                  {f.n}
                </span>
                <div>
                  <div
                    className="mb-1.5 text-[19px] font-semibold tracking-[-0.02em] transition-colors duration-300"
                    style={{ color: on ? '#f2f0ed' : 'rgba(242,240,237,.7)' }}
                  >
                    {f.title}
                  </div>
                  <p className="m-0 max-w-[44ch] text-[14.5px] leading-[1.55] text-[rgba(242,240,237,.5)]">
                    {f.body}
                  </p>
                </div>
              </div>
            )
          })}
          <div className="border-t border-white/[0.09]" />
        </div>

        <div className="sticky top-8">
          <div className="relative min-h-[300px] overflow-hidden rounded-[14px] border border-white/[0.09] bg-[#0e1012] px-[26px] pb-[26px] pt-7 shadow-[0_20px_50px_rgba(0,0,0,.4)]">
            <span className="bl-mono pointer-events-none absolute right-4 top-0.5 select-none text-[96px] font-semibold leading-none text-white/[0.035]">
              {active.n}
            </span>
            <div className="relative mb-5 flex items-center gap-2">
              <span
                className="bl-orb-core h-1.5 w-1.5 rounded-full bg-[#ff6600]"
                style={{ boxShadow: '0 0 10px rgba(255,102,0,.8)', animationDuration: '2s' }}
              />
              <span className="bl-mono text-[11px] uppercase tracking-[0.08em] text-[#ff6600]">
                {active.tag}
              </span>
            </div>
            <div className="relative mb-[18px] max-w-[20ch] text-[22px] font-semibold leading-[1.25] tracking-[-0.02em]">
              {active.title}
            </div>
            <div className="bl-mono relative whitespace-pre-wrap rounded-[9px] border border-white/[0.07] bg-white/[0.03] px-[15px] py-[13px] text-[12.5px] leading-[1.75] text-[rgba(242,240,237,.75)]">
              {active.snippet}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
