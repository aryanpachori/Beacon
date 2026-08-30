'use client'

import { useEffect, useState } from 'react'
import { Radar, Copy, Check, Sparkles, Terminal, Blocks, HelpCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchAgentActivity, type AgentEventItem } from '@/lib/api'

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#dc2f2f',
  high: '#dc2f2f',
  medium: '#9a9a9a',
  low: '#9a9a9a',
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

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
  const [events, setEvents] = useState<AgentEventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgentActivity()
      .then((data) => {
        setEvents(data)
        if (data.length > 0) setSkipped(true)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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

      <div className="dl-card overflow-hidden !p-0">
        {!skipped && (
          <div className="p-5">
            <h3 className="text-[13px] font-semibold text-dl-navy">Connect your agent</h3>
            <p className="mt-1 text-[12px] text-dl-muted">
              Run this, then your agent can call Beacon before it writes risky code.
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {AGENTS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setAgent(key)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors',
                    agent === key
                      ? 'bg-dl-blue text-[#f8f8f8]'
                      : 'border border-dl-border text-dl-muted hover:border-[#333338] hover:text-dl-text'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <div
              className="mt-3 flex items-center gap-2 rounded-lg border border-dl-border px-4 py-2.5"
              style={{ background: 'var(--dl-chip-bg)' }}
            >
              <Terminal className="h-3.5 w-3.5 shrink-0 text-dl-muted" />
              <code className="flex-1 overflow-x-auto font-mono text-[12.5px] text-dl-text">
                {active.command}
              </code>
              <button
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1 rounded-md border border-dl-border px-2 py-1 text-[11px] font-medium text-dl-muted hover:border-[#333338] hover:text-dl-text transition-colors"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11.5px] text-dl-muted">
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

        {loading ? (
          <div className={cn('px-6 py-10 text-center text-[12px] text-dl-muted', !skipped && 'border-t border-dl-border')}>
            Loading agent activity…
          </div>
        ) : events.length > 0 ? (
          <div className={cn('divide-y divide-dl-border', !skipped && 'border-t border-dl-border')}>
            {events.map((e) => (
              <div key={e.id} className="flex items-start gap-3 px-5 py-3.5">
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: e.severity ? SEVERITY_COLOR[e.severity] : '#9a9a9a' }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[12.5px] font-semibold text-dl-navy">
                      {e.category?.replace(/_/g, ' ') ?? e.eventType.replace(/_/g, ' ')}
                    </span>
                    {e.severity && (
                      <span
                        className="rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide"
                        style={{ color: SEVERITY_COLOR[e.severity], background: 'var(--dl-chip-bg)' }}
                      >
                        {e.severity}
                      </span>
                    )}
                    <span className="rounded px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-wide text-dl-muted" style={{ background: 'var(--dl-chip-bg)' }}>
                      {e.triggeredBy}
                    </span>
                    <span className="ml-auto text-[11px] text-dl-muted">{relativeTime(e.createdAt)}</span>
                  </div>
                  {e.description && (
                    <p className="mt-1 text-[12px] leading-relaxed text-dl-muted">{e.description}</p>
                  )}
                  {e.filePath && (
                    <p className="mt-1 font-mono text-[11px] text-dl-muted">
                      {e.filePath}
                      {e.lineRange && `:${e.lineRange[0]}`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={cn(
            'flex flex-col items-center justify-center px-6 py-10 text-center',
            !skipped && 'border-t border-dl-border'
          )}>
            <div
              className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: 'var(--dl-chip-bg)' }}
            >
              <Radar className="h-5 w-5 text-dl-muted" />
            </div>
            <p className="text-[13px] font-semibold text-dl-navy">No agent activity yet</p>
            <p className="mt-1 max-w-sm text-[12px] text-dl-muted">
              Findings from CLI, MCP, and IDE-extension scans will appear here once connected.
            </p>

            <div
              className="mt-4 flex items-center gap-2 rounded-lg border border-dl-border px-3.5 py-2 font-mono text-[12px] text-dl-text"
              style={{ background: 'var(--dl-chip-bg)' }}
            >
              <Terminal className="h-3.5 w-3.5 shrink-0 text-dl-muted" />
              npx @forgefastlabs/beacon-cli init
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
