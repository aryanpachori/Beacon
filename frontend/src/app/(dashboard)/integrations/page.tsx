'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, MessageCircle, RefreshCw, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'

type WebhookStatus = { type: 'success' | 'error'; text: string } | null

function HelperText({ text }: { text: string }) {
  return <p className="mt-1 text-[11px] text-dl-hint">{text}</p>
}

function StatusBlock({ status }: { status: WebhookStatus }) {
  if (!status) return null
  return (
    <div className={cn(
      'flex items-start gap-2 rounded-lg border p-3 text-xs leading-relaxed',
      status.type === 'success'
        ? 'border-dl-healthy/30 bg-dl-healthy/10 text-dl-healthy'
        : 'border-dl-critical/30 bg-dl-critical/10 text-dl-critical'
    )}>
      {status.type === 'success'
        ? <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
        : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
      <span>{status.text}</span>
    </div>
  )
}

interface OrgIntegration {
  slackWebhookUrl?: string | null
  slackEnabled?: boolean
  gchatWebhookUrl?: string | null
  gchatEnabled?: boolean
  digestEmail?: string | null
  digestEnabled?: boolean
  digestFrequency?: string | null
  alertThreshold?: number | null
}

export default function IntegrationsPage() {
  const [slackUrl, setSlackUrl] = useState('')
  const [slackLoading, setSlackLoading] = useState(false)
  const [slackStatus, setSlackStatus] = useState<WebhookStatus>(null)

  const [gchatUrl, setGchatUrl] = useState('')
  const [gchatLoading, setGchatLoading] = useState(false)
  const [gchatStatus, setGchatStatus] = useState<WebhookStatus>(null)

  const [digestLoading, setDigestLoading] = useState(false)
  const [digestStatus, setDigestStatus] = useState<WebhookStatus>(null)

  const [loading, setLoading] = useState(true)

  // Load saved settings from DB on mount
  const loadSettings = useCallback(async () => {
    try {
      const data = await apiFetch<OrgIntegration>('/api/integrations/')
      if (data.slackWebhookUrl) {
        setSlackUrl(data.slackWebhookUrl)
        if (data.slackEnabled) setSlackStatus({ type: 'success', text: 'Connected ✓ — Slack webhook verified and active.' })
      }
      if (data.gchatWebhookUrl) {
        setGchatUrl(data.gchatWebhookUrl)
        if (data.gchatEnabled) setGchatStatus({ type: 'success', text: 'Connected ✓ — Google Chat webhook verified and active.' })
      }
    } catch {
      // No integration configured yet — that's fine
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadSettings() }, [loadSettings])

  // Slack: send test via backend (saves + verifies)
  const handleTestSlack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slackUrl) return
    setSlackLoading(true)
    setSlackStatus(null)
    try {
      await apiFetch('/api/integrations/slack/test', {
        method: 'POST',
        body: JSON.stringify({ webhookUrl: slackUrl }),
      })
      setSlackStatus({ type: 'success', text: 'Success! Test alert delivered to Slack. Webhook saved.' })
    } catch (err) {
      setSlackStatus({ type: 'error', text: err instanceof Error ? err.message : 'Failed to send Slack test.' })
    } finally {
      setSlackLoading(false)
    }
  }

  // Google Chat: send test via backend (saves + verifies)
  const handleTestGchat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gchatUrl) return
    setGchatLoading(true)
    setGchatStatus(null)
    try {
      await apiFetch('/api/integrations/gchat/test', {
        method: 'POST',
        body: JSON.stringify({ webhookUrl: gchatUrl }),
      })
      setGchatStatus({ type: 'success', text: 'Success! Test card delivered to Google Chat. Webhook saved.' })
    } catch (err) {
      setGchatStatus({ type: 'error', text: err instanceof Error ? err.message : 'Failed to send Google Chat test.' })
    } finally {
      setGchatLoading(false)
    }
  }

  // Trigger digest via Next.js proxy (which holds the internal secret server-side)
  const handleTriggerDigest = async (e: React.FormEvent) => {
    e.preventDefault()
    setDigestLoading(true)
    setDigestStatus(null)
    try {
      const res = await fetch('/api/cron/daily-digest', { method: 'POST' })
      const data = await res.json().catch(() => ({})) as { success?: boolean; sent?: number; failed?: number; error?: string }
      if (!res.ok || data.error) throw new Error(data.error ?? 'Failed')
      setDigestStatus({
        type: 'success',
        text: `Digest sent to ${data.sent ?? 1} installation(s).${(data.failed ?? 0) > 0 ? ` (${data.failed} failed)` : ''}`,
      })
    } catch (err) {
      setDigestStatus({ type: 'error', text: err instanceof Error ? err.message : 'Failed to trigger digest.' })
    } finally {
      setDigestLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="app-page flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-dl-teal" />
      </div>
    )
  }

  return (
    <div className="app-page">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-heading text-dl-forest">Integrations</h1>
          <p className="page-description text-dl-muted">
            Configure external alerting channels. Settings are saved to your account.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Slack */}
        <div className="dl-card flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-dl-teal" />
            <h2 className="card-heading">Slack Alerts</h2>
          </div>
          <p className="text-[13px] leading-relaxed text-dl-muted">
            Receive instant Slack Block Kit notifications whenever a package score drops or a tier changes.
          </p>

          <form onSubmit={handleTestSlack} className="flex flex-col gap-3">
            <div>
              <label className="form-label">Webhook URL</label>
              <input
                type="url"
                required
                value={slackUrl}
                onChange={e => { setSlackUrl(e.target.value); setSlackStatus(null) }}
                placeholder="https://hooks.slack.com/services/..."
                className="dash-input w-full"
              />
              <HelperText text="Paste your Incoming Webhook URL from Slack App settings" />
            </div>
            <button
              type="submit"
              disabled={slackLoading || !slackUrl}
              className="btn-dash-primary flex min-w-[180px] items-center justify-center gap-2 self-start"
            >
              {slackLoading
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Sending test…</>
                : 'Save & Send Test Alert'}
            </button>
          </form>
          <StatusBlock status={slackStatus} />
        </div>

        {/* Google Chat */}
        <div className="dl-card flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-dl-teal" />
            <h2 className="card-heading">Google Chat Alerts</h2>
          </div>
          <p className="text-[13px] leading-relaxed text-dl-muted">
            Receive rich Card V2 notifications in Google Chat whenever a package score drops.
          </p>

          <form onSubmit={handleTestGchat} className="flex flex-col gap-3">
            <div>
              <label className="form-label">Webhook URL</label>
              <input
                type="url"
                required
                value={gchatUrl}
                onChange={e => { setGchatUrl(e.target.value); setGchatStatus(null) }}
                placeholder="https://chat.googleapis.com/v1/spaces/..."
                className="dash-input w-full"
              />
              <HelperText text="Paste your Google Chat Space webhook URL" />
            </div>
            <button
              type="submit"
              disabled={gchatLoading || !gchatUrl}
              className="btn-dash-primary flex min-w-[180px] items-center justify-center gap-2 self-start"
            >
              {gchatLoading
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Sending test…</>
                : 'Save & Send Test Alert'}
            </button>
          </form>
          <StatusBlock status={gchatStatus} />
        </div>

        {/* Daily Digest trigger */}
        <div className="dl-card flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-dl-teal" />
            <h2 className="card-heading">Daily Digest</h2>
          </div>
          <p className="text-[13px] leading-relaxed text-dl-muted">
            Manually trigger the daily health digest email for all monitored installations. Normally runs automatically at 01:00 UTC.
          </p>

          <form onSubmit={handleTriggerDigest} className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={digestLoading}
              className="btn-dash-primary flex min-w-[220px] items-center justify-center gap-2 self-start"
            >
              {digestLoading
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Sending…</>
                : 'Send Digest Now'}
            </button>
          </form>
          <StatusBlock status={digestStatus} />
        </div>
      </div>
    </div>
  )
}
