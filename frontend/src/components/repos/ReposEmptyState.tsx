'use client'

import { GitBranch, Lock, Shield } from 'lucide-react'

interface ReposEmptyStateProps {
  onConnect: () => void
}

export function ReposEmptyState({ onConnect }: ReposEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <GitBranch className="h-12 w-12 text-dl-sage" strokeWidth={1.25} aria-hidden />
      <h2 className="mt-4 text-[18px] font-medium text-dl-forest">No repositories connected</h2>
      <p className="mt-2 mb-6 max-w-[360px] text-[13px] leading-relaxed text-dl-muted">
        Connect a GitHub repository to scan manifests, score every dependency, and get AI alerts
        before packages are abandoned.
      </p>
      <button type="button" className="btn-dash-primary" onClick={onConnect}>
        Connect your first repo
      </button>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-[12px] text-dl-hint">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-dl-healthy" aria-hidden />
          SOC 2 in progress
        </span>
        <span className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" aria-hidden />
          Read-only GitHub access
        </span>
        <span className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5" aria-hidden />
          No code ever stored
        </span>
      </div>
    </div>
  )
}
