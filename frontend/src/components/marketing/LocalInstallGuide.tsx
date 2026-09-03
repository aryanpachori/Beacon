'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy } from 'lucide-react'

const STEPS: { id?: string; title: string; body: string; command?: string }[] = [
  {
    title: '1. Init locally',
    body: 'Writes agent rules and optional pre-commit hook. No account required.',
    command: 'npx -y @forgefastlabs/beacon-cli init --hooks',
  },
  {
    id: 'mcp',
    title: '2. Connect MCP (Cursor / Claude / Windsurf)',
    body: 'Stdio MCP server — scans stay on your machine.',
    command: 'npx -y @forgefastlabs/beacon-mcp',
  },
  {
    title: '3. Scan from the terminal',
    body: 'Run a full local scan anytime.',
    command: 'npx -y @forgefastlabs/beacon-cli scan --type all',
  },
  {
    title: '4. IDE extension (optional)',
    body: 'Gutter diagnostics, package health hovers, and Fix with Beacon. Build from the monorepo or install the VSIX when published.',
  },
]

function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(command).catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 1400)
      }}
      className="mt-3 flex w-full items-center gap-2 rounded-lg border border-black/[0.1] bg-[#f7f6f4] px-3 py-2.5 text-left font-mono text-[12.5px] text-[rgba(8,9,10,.88)] hover:border-black/25"
    >
      <span className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap">{command}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 opacity-50" />
      )}
    </button>
  )
}

export function LocalInstallGuide() {
  return (
    <div className="space-y-4">
      {STEPS.map((step) => (
        <div
          key={step.title}
          id={step.id}
          className="rounded-xl border border-black/[0.09] bg-white p-5 sm:p-6"
        >
          <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-[#08090a]">
            {step.title}
          </h3>
          <p className="mt-1.5 text-[14px] leading-[1.55] text-[rgba(8,9,10,.6)]">{step.body}</p>
          {step.command ? <CopyCommand command={step.command} /> : null}
        </div>
      ))}

      <div className="rounded-xl border border-dashed border-black/[0.14] bg-black/[0.02] p-5 sm:p-6">
        <h3 className="text-[16px] font-semibold tracking-[-0.02em]">
          Optional: sync to the cloud dashboard
        </h3>
        <p className="mt-1.5 text-[14px] leading-[1.55] text-[rgba(8,9,10,.6)]">
          Local scans never need an account. Create one only if you want findings in Agent Activity.
          Set <code className="rounded bg-black/[0.06] px-1 text-[12px]">BEACON_API_URL</code> and{' '}
          <code className="rounded bg-black/[0.06] px-1 text-[12px]">BEACON_API_TOKEN</code>, then
          pass <code className="rounded bg-black/[0.06] px-1 text-[12px]">--sync</code> on the CLI.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="inline-flex items-center rounded-full bg-[#08090a] px-4 py-2 text-[13px] font-semibold text-[#f2f0ed] hover:opacity-90"
          >
            Create account
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center rounded-full border border-black/15 px-4 py-2 text-[13px] font-semibold text-[#08090a] hover:border-black/30"
          >
            Read docs
          </Link>
        </div>
      </div>
    </div>
  )
}
