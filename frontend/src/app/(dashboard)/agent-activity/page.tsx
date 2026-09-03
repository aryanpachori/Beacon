'use client'

import { useCallback, useEffect, useState } from 'react'
import { Radar, Copy, Check, Sparkles, Terminal, Blocks, HelpCircle, AlertTriangle, Link2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  createAgentSyncToken,
  fetchAgentActivity,
  type AgentEventItem,
} from '@/lib/api'

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
  {
    key: 'claude',
    label: 'Claude',
    icon: Sparkles,
    command: 'claude mcp add beacon -- npx -y @forgefastlabs/beacon-mcp',
  },
  {
    key: 'codex',
    label: 'Codex',
    icon: Terminal,
    command: 'npx -y @forgefastlabs/beacon-mcp',
  },
  {
    key: 'cursor',
    label: 'Cursor',
    icon: Blocks,
    command: 'npx -y @forgefastlabs/beacon-mcp',
  },
  { key: 'other', label: 'Other', icon: HelpCircle, command: 'npx -y @forgefastlabs/beacon-mcp' },
]

export default function AgentActivityPage() {
  const [agent, setAgent] = useState<AgentKey>('claude')
  const [copied, setCopied] = useState(false)
  const [copiedConnect, setCopiedConnect] = useState(false)
  const [skipped, setSkipped] = useState(false)
  const [events, setEvents] = useState<AgentEventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [connectCommand, setConnectCommand] = useState<string | null>(null)
  const [connectError, setConnectError] = useState<string | null>(null)
  const [connectLoading, setConnectLoading] = useState(false)

  const loadEvents = useCallback(async () => {
    try {
      const data = await fetchAgentActivity()
      setEvents(data)
      if (data.length > 0) setSkipped(true)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadEvents()
    const id = window.setInterval(() => {
      void loadEvents()
    }, 15_000)
    return () => window.clearInterval(id)
  }, [loadEvents])

  const active = AGENTS.find((a) => a.key === agent)!

  function handleCopy() {
    navigator.clipboard.writeText(active.command).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  async function handleConnectMachine() {
    setConnectLoading(true)
    setConnectError(null)
    try {
      const res = await createAgentSyncToken()
      setConnectCommand(res.connectCommand)
      await navigator.clipboard.writeText(res.connectCommand)
      setCopiedConnect(true)
      setTimeout(() => setCopiedConnect(false), 2000)
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Could not create sync token')
    } finally {
      setConnectLoading(false)
    }
  }

  return (
    <div className="app-page">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="page-heading">Agent Activity</h2>
          <p className="page-description">
            Findings from CLI, MCP, and IDE-extension scans, as they happen.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadEvents()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dl-border px-3 py-1.5 text-[12px] text-dl-muted hover:text-dl-text"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      <div className="dl-card mb-4 !p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-[13px] font-semibold text-dl-navy">Connect this machine</h3>
            <p className="mt-1 max-w-xl text-[12px] text-dl-muted">
              Local scans do not appear here until you link your machine. Copy the command, run it
              once in your project terminal, then run a scan — findings sync automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleConnectMachine()}
            disabled={connectLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-dl-blue px-3 py-2 text-[12px] font-medium text-[#f8f8f8] disabled:opacity-60"
          >
            <Link2 className="h-3.5 w-3.5" />
            {connectLoading ? 'Generating…' : copiedConnect ? 'Copied!' : 'Copy connect command'}
          </button>
        </div>
        {connectError && (
          <p className="mt-2 text-[12px] text-[#dc2f2f]">{connectError}</p>
        )}
        {connectCommand && (
          <div
            className="mt-3 flex items-start gap-2 rounded-lg border border-dl-border px-3 py-2 font-mono text-[11px] text-dl-text"
            style={{ background: 'var(--dl-chip-bg)' }}
          >
            <Terminal className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dl-muted" />
            <span className="min-w-0 flex-1 break-all">{connectCommand}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(connectCommand).catch(() => {})
                setCopiedConnect(true)
                setTimeout(() => setCopiedConnect(false), 1600)
              }}
              className="shrink-0 text-dl-muted hover:text-dl-text"
            >
              {copiedConnect ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
        <p className="mt-2 text-[11px] text-dl-muted">
          Then: <span className="font-mono">npx @forgefastlabs/beacon-cli scan --type security</span>
        </p>
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
              className="mt-3 flex items-center gap-2 rounded-lg border border-dl-border px-3 py-2.5 font-mono text-[12px] text-dl-text"
              style={{ background: 'var(--dl-chip-bg)' }}
            >
              <span className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap">{active.command}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 text-dl-muted hover:text-dl-text"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSkipped(true)}
                className="text-[12px] text-dl-muted hover:text-dl-text"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className={cn('px-6 py-10 text-center text-[12px] text-dl-muted', !skipped && 'border-t border-dl-border')}>
            Loading…
          </div>
        ) : events.length > 0 ? (
          <div className={cn(!skipped && 'border-t border-dl-border')}>
            {events.map((e) => (
              <div
                key={e.id}
                className="flex gap-3 border-b border-dl-border px-5 py-3.5 last:border-b-0"
              >
                <div
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{
                    background:
                      e.severity && SEVERITY_COLOR[e.severity]
                        ? SEVERITY_COLOR[e.severity]
                        : 'var(--dl-border)',
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[12.5px] font-medium text-dl-navy">
                      {e.category ?? e.eventType}
                    </span>
                    {e.severity && (
                      <span
                        className="rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide"
                        style={{ color: SEVERITY_COLOR[e.severity], background: 'var(--dl-chip-bg)' }}
                      >
                        {e.severity}
                      </span>
                    )}
                    <span
                      className="rounded px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-wide text-dl-muted"
                      style={{ background: 'var(--dl-chip-bg)' }}
                    >
                      {e.triggeredBy}
                    </span>
                    <span className="ml-auto text-[11px] text-dl-muted">
                      {relativeTime(e.createdAt)}
                    </span>
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
          <div
            className={cn(
              'flex flex-col items-center justify-center px-6 py-10 text-center',
              !skipped && 'border-t border-dl-border'
            )}
          >
            <div
              className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: 'var(--dl-chip-bg)' }}
            >
              <Radar className="h-5 w-5 text-dl-muted" />
            </div>
            <p className="text-[13px] font-semibold text-dl-navy">No agent activity yet</p>
            <p className="mt-1 max-w-sm text-[12px] text-dl-muted">
              Click <strong>Copy connect command</strong> above, run it locally, then scan. This page
              refreshes every 15s.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-dl-muted">
              <AlertTriangle className="h-3.5 w-3.5" />
              MCP alone does not update the website until this machine is connected.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
