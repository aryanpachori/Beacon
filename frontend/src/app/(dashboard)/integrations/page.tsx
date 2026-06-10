'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, MessageCircle, RefreshCw, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const TEST_ALERT = {
  packageId: 'moment',
  packageName: 'moment',
  spsBefore: 42,
  spsAfter: 8,
  tier: 'critical',
  triggerReason: 'Maintainer account transfer to unverified user & all repository funding links removed.',
  effortEstimate: { sprintWeeks: 2, linesImpacted: 1240, filesAffected: 23 },
}

type WebhookStatus = { type: 'success' | 'error'; text: string } | null

function HelperText({ text }: { text: string }) {
  return <p className="mt-1 text-[11px] text-dl-hint">{text}</p>
}

function StatusBlock({ status }: { status: WebhookStatus }) {
  if (!status) return null
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border p-3 text-xs leading-relaxed',
        status.type === 'success'
          ? 'border-dl-healthy/30 bg-dl-healthy/10 text-dl-healthy'
          : 'border-dl-critical/30 bg-dl-critical/10 text-dl-critical'
      )}
    >
      {status.type === 'success' ? (
        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{status.text}</span>
    </div>
  )
}

export default function IntegrationsPage() {
  const [slackUrl, setSlackUrl] = useState('')
  const [slackLoading, setSlackLoading] = useState(false)
  const [slackStatus, setSlackStatus] = useState<WebhookStatus>(null)

  const [googleChatUrl, setGoogleChatUrl] = useState('')
  const [googleChatLoading, setGoogleChatLoading] = useState(false)
  const [googleChatStatus, setGoogleChatStatus] = useState<WebhookStatus>(null)

  const [cronEmail, setCronEmail] = useState('team@company.com')
  const [cronLoading, setCronLoading] = useState(false)
  const [cronStatus, setCronStatus] = useState<WebhookStatus>(null)

  // Pre-fill from localStorage on mount
  useEffect(() => {
    const cachedSlack = localStorage.getItem('driftlogg_slack_url')
    if (cachedSlack) {
      setSlackUrl(cachedSlack)
      setSlackStatus({ type: 'success', text: 'Connected ✓ — previously verified webhook URL.' })
    }

    const cachedGChat = localStorage.getItem('driftlogg_google_chat_url')
    if (cachedGChat) {
      setGoogleChatUrl(cachedGChat)
      setGoogleChatStatus({ type: 'success', text: 'Connected ✓ — previously verified webhook URL.' })
    }
  }, [])

  // Reset status when URL changes
  const handleSlackUrlChange = (val: string) => {
    setSlackUrl(val)
    if (slackStatus) setSlackStatus(null)
  }
  const handleGChatUrlChange = (val: string) => {
    setGoogleChatUrl(val)
    if (googleChatStatus) setGoogleChatStatus(null)
  }

  const handleTestSlack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slackUrl) return
    setSlackLoading(true)
    setSlackStatus(null)
    try {
      const res = await fetch('/api/integrations/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: slackUrl, alert: TEST_ALERT }),
      })
      const data = await res.json()
      if (res.ok) {
        setSlackStatus({ type: 'success', text: 'Success! Block Kit alert delivered to Slack.' })
        localStorage.setItem('driftlogg_slack_url', slackUrl)
      } else {
        setSlackStatus({ type: 'error', text: data.error || 'Failed to dispatch Slack webhook.' })
      }
    } catch (err: unknown) {
      setSlackStatus({ type: 'error', text: err instanceof Error ? err.message : 'Network error occurred.' })
    } finally {
      setSlackLoading(false)
    }
  }

  const handleTestGoogleChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!googleChatUrl) return
    setGoogleChatLoading(true)
    setGoogleChatStatus(null)
    try {
      const res = await fetch('/api/integrations/google-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: googleChatUrl, alert: TEST_ALERT }),
      })
      const data = await res.json()
      if (res.ok) {
        setGoogleChatStatus({ type: 'success', text: 'Success! Card alert delivered to Google Chat.' })
        localStorage.setItem('driftlogg_google_chat_url', googleChatUrl)
      } else {
        setGoogleChatStatus({ type: 'error', text: data.error || 'Failed to dispatch Google Chat webhook.' })
      }
    } catch (err: unknown) {
      setGoogleChatStatus({ type: 'error', text: err instanceof Error ? err.message : 'Network error occurred.' })
    } finally {
      setGoogleChatLoading(false)
    }
  }

  const handleTriggerDigest = async (e: React.FormEvent) => {
    e.preventDefault()
    setCronLoading(true)
    setCronStatus(null)
    try {
      const res = await fetch('/api/cron/daily-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgName: 'Acme Corp', recipientEmail: cronEmail }),
      })
      const data = await res.json()
      if (res.ok) {
        setCronStatus({
          type: 'success',
          text: data.simulated
            ? `${data.message} (Simulated values: Health Index ${data.data.healthIndex}/100)`
            : 'Daily digest compiled and batch sent successfully.',
        })
      } else {
        setCronStatus({ type: 'error', text: data.error || 'Failed to run digest.' })
      }
    } catch (err: unknown) {
      setCronStatus({ type: 'error', text: err instanceof Error ? err.message : 'An error occurred.' })
    } finally {
      setCronLoading(false)
    }
  }

  return (
    <div className="app-page">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-heading text-dl-forest">Integrations</h1>
          <p className="page-description text-dl-muted">
            Configure external alerting endpoints and manage subscription webhooks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Slack Card */}
        <div className="dl-card flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-dl-teal" />
            <h2 className="card-heading">Slack Alerts (Block Kit)</h2>
          </div>
          <p className="text-[13px] leading-relaxed text-dl-muted">
            Configure a Slack Webhook URL to deliver instant Block Kit notification cards whenever a package score drops.
          </p>

          <form onSubmit={handleTestSlack} className="flex flex-col gap-3">
            <div>
              <label className="form-label">Webhook URL</label>
              <input
                type="url"
                required
                value={slackUrl}
                onChange={(e) => handleSlackUrlChange(e.target.value)}
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
              {slackLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Sending test…
                </>
              ) : 'Save & Send Test Alert'}
            </button>
          </form>

          <StatusBlock status={slackStatus} />
        </div>

        {/* Google Chat Card */}
        <div className="dl-card flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-dl-teal" />
            <h2 className="card-heading">Google Chat Alerts (Card V2)</h2>
          </div>
          <p className="text-[13px] leading-relaxed text-dl-muted">
            Configure a Google Chat Webhook URL to deliver rich Card V2 notification updates whenever a package score drops.
          </p>

          <form onSubmit={handleTestGoogleChat} className="flex flex-col gap-3">
            <div>
              <label className="form-label">Webhook URL</label>
              <input
                type="url"
                required
                value={googleChatUrl}
                onChange={(e) => handleGChatUrlChange(e.target.value)}
                placeholder="https://chat.googleapis.com/v1/spaces/..."
                className="dash-input w-full"
              />
              <HelperText text="Paste your Google Chat Space webhook URL" />
            </div>

            <button
              type="submit"
              disabled={googleChatLoading || !googleChatUrl}
              className="btn-dash-primary flex min-w-[180px] items-center justify-center gap-2 self-start"
            >
              {googleChatLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Sending test…
                </>
              ) : 'Save & Send Test Alert'}
            </button>
          </form>

          <StatusBlock status={googleChatStatus} />
        </div>

        {/* Daily Digest Scheduler */}
        <div className="dl-card flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-pulse text-dl-teal" />
            <h2 className="card-heading">Daily Digest Scheduler Cron</h2>
          </div>
          <p className="text-[13px] leading-relaxed text-dl-muted">
            Aggregates organization dependencies and compile daily score delta changes. Sends compiled digest summary.
          </p>

          <form onSubmit={handleTriggerDigest} className="flex flex-col gap-3">
            <div>
              <label className="form-label">Recipient Email</label>
              <input
                type="email"
                required
                value={cronEmail}
                onChange={(e) => setCronEmail(e.target.value)}
                placeholder="engineering@yourcompany.com"
                className="dash-input w-full"
              />
              <HelperText text="You'll receive alerts at this address" />
            </div>

            <button
              type="submit"
              disabled={cronLoading}
              className="btn-dash-primary flex min-w-[220px] items-center justify-center gap-2 self-start"
            >
              {cronLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Running…
                </>
              ) : 'Run Cron Scheduler Aggregator'}
            </button>
          </form>

          <StatusBlock status={cronStatus} />
        </div>
      </div>
    </div>
  )
}
