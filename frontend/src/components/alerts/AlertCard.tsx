'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, RefreshCw, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Alert } from '@/types'
import { TierChip } from '@/components/ui/TierChip'
import { spsToTier, tierColor } from '@/lib/constants'
import {
  getAlertAiReason,
  getAlertSignalPills,
  getTierChangeLabel,
  isAlertUnread,
} from '@/lib/alertsData'
import { cn } from '@/lib/utils'
import { useRelativeTime } from '@/hooks/useRelativeTime'

interface AlertCardProps {
  alert: Alert
}

const TIER_BORDER: Record<Alert['tier'], string> = {
  critical: 'border-l-dl-critical',
  'at-risk': 'border-l-dl-risk',
  watch: 'border-l-dl-watch',
  healthy: 'border-l-dl-healthy',
}

export function AlertCard({ alert }: AlertCardProps) {
  const beforeTier = spsToTier(alert.spsBefore)
  const afterTier = alert.tier
  const unread = isAlertUnread(alert)
  const pills = getAlertSignalPills(alert)
  const aiReason = getAlertAiReason(alert)
  const timeLabel = useRelativeTime(alert.firedAt)

  const [jiraLoading, setJiraLoading] = useState(false)
  const [jiraUrl, setJiraUrl] = useState<string | null>(alert.jiraCreated ? '#' : null)
  const [resolved, setResolved] = useState(false)

  const handleOpenJira = async () => {
    if (alert.jiraCreated || (jiraUrl && jiraUrl !== '#')) {
      window.open(jiraUrl === '#' ? 'https://jira.atlassian.com' : (jiraUrl || ''), '_blank')
      return
    }

    const domain = localStorage.getItem('driftlogg_jira_domain')
    const email = localStorage.getItem('driftlogg_jira_email')
    const token = localStorage.getItem('driftlogg_jira_token')
    const projectKey = localStorage.getItem('driftlogg_jira_proj_key')

    if (!domain || !email || !token || !projectKey) {
      toast.error('JIRA integration not configured. Go to Integrations to set it up.')
      return
    }

    setJiraLoading(true)
    try {
      const res = await fetch('/api/integrations/jira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          email,
          apiToken: token,
          projectKey,
          alert,
          recommendations: [
            { name: 'dayjs', sps: 94, weeklyDownloads: 18500000, ecosystem: 'npm' },
            { name: 'date-fns', sps: 91, weeklyDownloads: 32000000, ecosystem: 'npm' },
          ],
          effortEstimate: { sprintWeeks: 1, linesImpacted: 150, filesAffected: 4 },
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setJiraUrl(data.issueUrl)
        toast.success(`JIRA ticket ${data.issueKey} created successfully!`)
        window.open(data.issueUrl, '_blank')
      } else {
        toast.error(`Failed to create JIRA ticket: ${data.error}`)
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Network error creating JIRA ticket.')
    } finally {
      setJiraLoading(false)
    }
  }

  const handleMarkResolved = () => {
    setResolved(true)
    toast.success('Alert marked as resolved.', {
      action: {
        label: 'Undo',
        onClick: () => setResolved(false),
      },
      duration: 4000,
    })
  }

  if (resolved) return null

  return (
    <article className={cn('dash-card mb-3 border-l-[3px] p-4', TIER_BORDER[alert.tier])}>
      <div className="mb-3 flex items-center gap-2">
        <TierChip tier={alert.tier} />
        <span className="text-[15px] font-medium text-dl-forest">{alert.packageName}</span>
        <div className="ml-auto flex items-center gap-2">
          <span
            className="text-[11px] text-dl-hint"
            title={new Date(alert.firedAt).toLocaleString()}
          >
            {timeLabel}
          </span>
          {unread && (
            <span
              className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-dl-teal"
              title="Unread"
              aria-label="Unread alert"
            />
          )}
        </div>
      </div>

      <div className="mb-1 flex items-center gap-2">
        <span className={cn('text-[20px] font-medium tabular-nums', tierColor(beforeTier, 'text'))}>
          {alert.spsBefore}
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-dl-muted" aria-hidden />
        <span className={cn('text-[20px] font-medium tabular-nums', tierColor(afterTier, 'text'))}>
          {alert.spsAfter}
        </span>
      </div>
      <p className="mb-3 text-[11px] text-dl-muted">{getTierChangeLabel(alert)}</p>

      <div className="mb-3 flex gap-2">
        <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-dl-teal" aria-hidden />
        <p className="text-[12px] leading-relaxed text-dl-muted">{aiReason}</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {pills.map(pill => (
          <span
            key={pill}
            className="rounded-full bg-dl-teal/10 px-2 py-0.5 text-[10px] text-dl-muted"
          >
            {pill}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/packages/${alert.packageId}`}
          className="text-[12px] font-medium text-dl-teal hover:underline"
        >
          View package →
        </Link>
        <button
          type="button"
          onClick={handleOpenJira}
          disabled={jiraLoading}
          className="btn-dash-secondary flex items-center gap-1.5 px-3 py-1.5 text-[12px]"
        >
          {jiraLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
          {alert.jiraCreated || jiraUrl ? 'Open in JIRA' : 'Create JIRA Task'}
        </button>
        <button
          type="button"
          onClick={handleMarkResolved}
          className="flex items-center gap-1 text-[12px] text-dl-hint transition-colors hover:text-dl-teal"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Mark resolved
        </button>
      </div>
    </article>
  )
}
