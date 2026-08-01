'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GitBranch, MessageSquare, MessageCircle, CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import { apiFetch, fetchOnboardingState, type OnboardingState } from '@/lib/api'

type OrgIntegration = {
  slackEnabled?: boolean
  gchatEnabled?: boolean
}

export function OverviewIntegrations() {
  const [github, setGithub] = useState<OnboardingState | null>(null)
  const [org, setOrg] = useState<OrgIntegration | null>(null)

  useEffect(() => {
    fetchOnboardingState().then(setGithub).catch(() => setGithub(null))
    apiFetch<OrgIntegration>('/api/integrations/').then(setOrg).catch(() => setOrg(null))
  }, [])

  const rows = [
    {
      key: 'github',
      icon: GitBranch,
      label: 'GitHub',
      connected: !!github?.connected,
      detail: github?.connected ? github.accountLogin : 'Not connected — optional',
      href: github?.connected ? '/integrations' : '/onboarding',
    },
    {
      key: 'slack',
      icon: MessageSquare,
      label: 'Slack',
      connected: !!org?.slackEnabled,
      detail: org?.slackEnabled ? 'Alerts active' : 'Not configured',
      href: '/integrations',
    },
    {
      key: 'gchat',
      icon: MessageCircle,
      label: 'Google Chat',
      connected: !!org?.gchatEnabled,
      detail: org?.gchatEnabled ? 'Alerts active' : 'Not configured',
      href: '/integrations',
    },
  ]

  return (
    <div className="dl-card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="card-heading">Connected Surfaces</h3>
        <Link href="/integrations" className="flex items-center gap-1 text-[11px] font-medium text-dl-blue hover:underline">
          Manage <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="divide-y divide-dl-border">
        {rows.map(({ key, icon: Icon, label, connected, detail, href }) => (
          <Link
            key={key}
            href={href}
            className="flex items-center gap-3 py-2.5 text-[12.5px] hover:opacity-80 transition-opacity"
          >
            <Icon className="h-4 w-4 shrink-0 text-dl-muted" />
            <span className="flex-1 font-medium text-dl-text">{label}</span>
            <span className="text-[11px] text-dl-muted">{detail}</span>
            {connected ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-dl-healthy" />
            ) : (
              <Circle className="h-3.5 w-3.5 shrink-0 text-dl-border" />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
