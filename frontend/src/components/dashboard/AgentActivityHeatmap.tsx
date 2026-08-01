'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const WEEKS = 14
const DAYS = 7

export function AgentActivityHeatmap() {
  return (
    <div className="dl-card">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="card-heading">Agent Activity</h3>
          <p className="mt-0.5 text-[11px] text-dl-muted">CLI, MCP, and IDE scans over the last 14 weeks</p>
        </div>
        <Link href="/agent-activity" className="flex items-center gap-1 text-[11px] font-medium text-dl-blue hover:underline">
          Connect <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {Array.from({ length: WEEKS }).map((_, w) => (
          <div key={w} className="flex flex-col gap-[3px]">
            {Array.from({ length: DAYS }).map((_, d) => (
              <div
                key={d}
                className="h-[11px] w-[11px] rounded-[2px] bg-dl-surface"
                title="No activity yet"
              />
            ))}
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-dl-muted">
        No agent activity yet — connect the CLI, MCP, or IDE extension to start filling this in.
      </p>
    </div>
  )
}
