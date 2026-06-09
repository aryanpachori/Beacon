'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, MessageCircle, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'

// Dummy alert payload for test triggers
const TEST_ALERT = {
  packageId: 'moment',
  packageName: 'moment',
  spsBefore: 42,
  spsAfter: 8,
  tier: 'critical',
  triggerReason: 'Maintainer account transfer to unverified user & all repository funding links removed.',
  effortEstimate: { sprintWeeks: 2, linesImpacted: 1240, filesAffected: 23 },
}

export default function IntegrationsPage() {

  // Slack Integration States
  const [slackUrl, setSlackUrl] = useState('')
  const [slackLoading, setSlackLoading] = useState(false)
  const [slackStatus, setSlackStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Google Chat Integration States
  const [googleChatUrl, setGoogleChatUrl] = useState('')
  const [googleChatLoading, setGoogleChatLoading] = useState(false)
  const [googleChatStatus, setGoogleChatStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Cron Scheduler states
  const [cronEmail, setCronEmail] = useState('team@company.com')
  const [cronLoading, setCronLoading] = useState(false)
  const [cronStatus, setCronStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Handles Slack Webhook Dispatch
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
      const message = err instanceof Error ? err.message : 'Network error occurred.'
      setSlackStatus({ type: 'error', text: message })
    } finally {
      setSlackLoading(false)
    }
  }

  // Handles Google Chat Webhook Dispatch
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
      const message = err instanceof Error ? err.message : 'Network error occurred.'
      setGoogleChatStatus({ type: 'error', text: message })
    } finally {
      setGoogleChatLoading(false)
    }
  }

  // Simulates Daily Digest compilation & batch sending
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
      const message = err instanceof Error ? err.message : 'An error occurred.'
      setCronStatus({ type: 'error', text: message })
    } finally {
      setCronLoading(false)
    }
  }

  // Load configuration details from cache on mount
  useEffect(() => {
    const cachedUrl = localStorage.getItem('driftlogg_slack_url')
    if (cachedUrl) setSlackUrl(cachedUrl)

    const cachedGoogleChatUrl = localStorage.getItem('driftlogg_google_chat_url')
    if (cachedGoogleChatUrl) setGoogleChatUrl(cachedGoogleChatUrl)
  }, [])

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
                onChange={(e) => setSlackUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="dash-input w-full"
              />
            </div>

            <button
              type="submit"
              disabled={slackLoading || !slackUrl}
              className="btn-dash-primary w-fit flex items-center gap-2"
            >
              {slackLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              Save & Send Test Alert
            </button>
          </form>

          {slackStatus && (
            <div
              className={`flex items-start gap-2 rounded-lg p-3 text-xs leading-relaxed ${
                slackStatus.type === 'success'
                  ? 'bg-dl-healthy/10 text-dl-healthy border border-dl-healthy/30'
                  : 'bg-dl-critical/10 text-dl-critical border border-dl-critical/30'
              }`}
            >
              {slackStatus.type === 'success' ? (
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <span>{slackStatus.text}</span>
            </div>
          )}
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
                onChange={(e) => setGoogleChatUrl(e.target.value)}
                placeholder="https://chat.googleapis.com/v1/spaces/..."
                className="dash-input w-full"
              />
            </div>

            <button
              type="submit"
              disabled={googleChatLoading || !googleChatUrl}
              className="btn-dash-primary w-fit flex items-center gap-2"
            >
              {googleChatLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              Save & Send Test Alert
            </button>
          </form>

          {googleChatStatus && (
            <div
              className={`flex items-start gap-2 rounded-lg p-3 text-xs leading-relaxed ${
                googleChatStatus.type === 'success'
                  ? 'bg-dl-healthy/10 text-dl-healthy border border-dl-healthy/30'
                  : 'bg-dl-critical/10 text-dl-critical border border-dl-critical/30'
              }`}
            >
              {googleChatStatus.type === 'success' ? (
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <span>{googleChatStatus.text}</span>
            </div>
          )}
        </div>





        {/* Daily Digest Scheduler Cron trigger */}
        <div className="dl-card flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-dl-teal animate-pulse" />
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
                className="dash-input w-full"
              />
            </div>

            <button
              type="submit"
              disabled={cronLoading}
              className="btn-dash-primary w-fit flex items-center gap-2"
            >
              {cronLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              Run Cron Scheduler Aggregator
            </button>
          </form>

          {cronStatus && (
            <div
              className={`flex items-start gap-2 rounded-lg p-3 text-xs leading-relaxed ${
                cronStatus.type === 'success'
                  ? 'bg-dl-healthy/10 text-dl-healthy border border-dl-healthy/30'
                  : 'bg-dl-critical/10 text-dl-critical border border-dl-critical/30'
              }`}
            >
              {cronStatus.type === 'success' ? (
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <span>{cronStatus.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
