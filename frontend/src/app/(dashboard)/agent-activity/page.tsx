'use client'

import { useState } from 'react'
import { Radar, Copy, Check, Sparkles, Terminal, Blocks, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// TODO: wire to GET /api/agent-activity once POST /api/v1/scans ingestion ships
// (see AgentEvent model in backend/prisma/schema.prisma)

type AgentKey = 'claude' | 'codex' | 'cursor' | 'other'

const AGENTS: { key: AgentKey; label: string; icon: React.ElementType; command: string }[] = [
  { key: 'claude', label: 'Claude', icon: Sparkles, command: 'claude mcp add --transport http beacon https://mcp.beacon.forgefastlabs.com/mcp' },
  { key: 'codex', label: 'Codex', icon: Terminal, command: 'codex mcp add --transport http beacon https://mcp.beacon.forgefastlabs.com/mcp' },
  { key: 'cursor', label: 'Cursor', icon: Blocks, command: 'cursor mcp add --transport http beacon https://mcp.beacon.forgefastlabs.com/mcp' },
  { key: 'other', label: 'Other', icon: HelpCircle, command: 'npx -y @forgefastlabs/beacon-mcp' },
]

export default function AgentActivityPage() {
  const [agent, setAgent] = useState<AgentKey>('claude')
  const [copied, setCopied] = useState(false)
  const [skipped, setSkipped] = useState(false)

  const active = AGENTS.find((a) => a.key === agent)!

  function handleCopy() {
    navigator.clipboard.writeText(active.command).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="app-page">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="page-heading">Agent Activity</h2>
          <p className="page-description">
            Findings from CLI, MCP, and IDE-extension scans, as they happen.
          </p>
        </div>
      </div>

      {!skipped && (
        <div className="mb-5 rounded-2xl border border-dl-border bg-dl-bg p-6">
          <h3 className="text-[15px] font-semibold text-dl-navy">Connect your agent</h3>
          <p className="mt-1 text-[12.5px] text-dl-muted">
            Run this, then your agent can call Beacon before it writes risky code.
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {AGENTS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setAgent(key)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all',
                  agent === key
                    ? 'bg-dl-navy text-dl-bg dark:bg-dl-blue dark:text-[#0b0a08]'
                    : 'border border-dl-border text-dl-muted hover:border-dl-muted hover:text-dl-text'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl border border-dl-border bg-dl-surface px-4 py-2.5">
            <Terminal className="h-3.5 w-3.5 shrink-0 text-dl-muted" />
            <code className="flex-1 overflow-x-auto font-mono text-[12.5px] text-dl-text">
              {active.command}
            </code>
            <button
              onClick={handleCopy}
              className="flex shrink-0 items-center gap-1 rounded-md border border-dl-border px-2 py-1 text-[11px] font-medium text-dl-muted hover:border-dl-muted hover:text-dl-text transition-colors"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] text-dl-muted">
              <span className="h-2 w-2 animate-pulse rounded-full border border-dl-border" />
              Waiting for your agent to connect… you can also continue and do this later.
            </div>
            <button
              onClick={() => setSkipped(true)}
              className="btn-dash-secondary !px-4 !py-2 !text-[12px]"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dl-border bg-dl-bg py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-dl-surface">
          <Radar className="h-7 w-7 text-dl-border" />
        </div>
        <p className="text-[15px] font-semibold text-dl-navy">No agent activity yet.</p>
        <p className="mt-1.5 max-w-sm text-sm text-dl-muted">
          Findings from CLI, MCP, and IDE-extension scans will appear here once connected.
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-xl border border-dl-border bg-dl-surface px-4 py-2.5 font-mono text-[13px] text-dl-text">
          <Terminal className="h-3.5 w-3.5 shrink-0 text-dl-muted" />
          npx @forgefastlabs/beacon-cli init
        </div>
      </div>
    </div>
  )
}
