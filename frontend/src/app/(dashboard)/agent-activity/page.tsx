'use client'

import { Radar, Terminal } from 'lucide-react'
import { NotificationBell } from '@/components/dashboard/NotificationBell'

// TODO: wire to GET /api/agent-activity once POST /api/v1/scans ingestion ships
// (see AgentEvent model in backend/prisma/schema.prisma)

export default function AgentActivityPage() {
  return (
    <div className="app-page">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="page-heading">Agent Activity</h2>
          <p className="page-description">
            Findings from CLI, MCP, and IDE-extension scans, as they happen.
          </p>
        </div>
        <NotificationBell />
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dl-border bg-dl-bg py-20 text-center">
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
