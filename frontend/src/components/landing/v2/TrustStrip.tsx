'use client'

const AGENTS = ['Cursor', 'Claude Code', 'Copilot', 'Windsurf', 'Zed', 'any MCP agent']

export function TrustStrip() {
  return (
    <div className="flex flex-wrap items-center gap-x-[34px] gap-y-3 border-t border-black/[0.07] py-[26px] pb-[74px]">
      <span className="bl-mono text-[11px] uppercase tracking-[0.08em] text-[rgba(8,9,10,.35)]">
        Reviews code from
      </span>
      {AGENTS.map((name) => (
        <span key={name} className="text-[15.5px] text-[rgba(8,9,10,.62)]">
          {name}
        </span>
      ))}
    </div>
  )
}
