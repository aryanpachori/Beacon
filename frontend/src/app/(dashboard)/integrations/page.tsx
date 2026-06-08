'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Briefcase, CreditCard, RefreshCw, CheckCircle, AlertTriangle, Play } from 'lucide-react'

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
  // Plan State (Simulated subscription)
  const [activePlan, setActivePlan] = useState('Starter')

  // Read cookie on mount
  useEffect(() => {
    const cookies = document.cookie.split('; ')
    const planCookie = cookies.find(row => row.startsWith('driftlogg_plan='))
    if (planCookie) {
      setActivePlan(planCookie.split('=')[1])
    }
  }, [])

  // Slack Integration States
  const [slackUrl, setSlackUrl] = useState('')
  const [slackLoading, setSlackLoading] = useState(false)
  const [slackStatus, setSlackStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // JIRA Integration States
  const [jiraDomain, setJiraDomain] = useState('')
  const [jiraEmail, setJiraEmail] = useState('')
  const [jiraToken, setJiraToken] = useState('')
  const [jiraProjKey, setJiraProjKey] = useState('')
  const [jiraLoading, setJiraLoading] = useState(false)
  const [jiraStatus, setJiraStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Razorpay simulation states
  const [razorpayLoading, setRazorpayLoading] = useState<string | null>(null)
  const [razorpayStatus, setRazorpayStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

  // Handles Jira Issue Creation
  const handleTestJira = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jiraDomain || !jiraEmail || !jiraToken || !jiraProjKey) {
      setJiraStatus({ type: 'error', text: 'All JIRA credentials are required.' })
      return
    }

    setJiraLoading(true)
    setJiraStatus(null)

    try {
      const res = await fetch('/api/integrations/jira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: jiraDomain,
          email: jiraEmail,
          apiToken: jiraToken,
          projectKey: jiraProjKey,
          alert: TEST_ALERT,
          recommendations: [
            { name: 'dayjs', sps: 94, weeklyDownloads: 18500000 },
            { name: 'date-fns', sps: 91, weeklyDownloads: 32000000 },
          ],
          effortEstimate: TEST_ALERT.effortEstimate,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        setJiraStatus({
          type: 'success',
          text: `Issue created successfully: ${data.issueKey}. Link: ${data.issueUrl}`,
        })
        localStorage.setItem('driftlogg_jira_domain', jiraDomain)
        localStorage.setItem('driftlogg_jira_email', jiraEmail)
        localStorage.setItem('driftlogg_jira_token', jiraToken)
        localStorage.setItem('driftlogg_jira_proj_key', jiraProjKey)
      } else {
        setJiraStatus({ type: 'error', text: data.error || 'Failed to connect to JIRA.' })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error occurred.'
      setJiraStatus({ type: 'error', text: message })
    } finally {
      setJiraLoading(false)
    }
  }

  // Simulates Razorpay Webhook Payloads
  const handleSimulateRazorpay = async (event: string) => {
    setRazorpayLoading(event)
    setRazorpayStatus(null)

    try {
      const res = await fetch('/api/webhooks/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': 'mock_signature_for_local_testing',
        },
        body: JSON.stringify({
          event,
          entity: 'event',
          payload: {
            payment: { entity: { id: 'pay_mock123', amount: 4900 } },
          },
        }),
      })
      const data = await res.json()

      if (res.ok) {
        setRazorpayStatus({
          type: 'success',
          text: `Webhook received: ${data.message} Active subscription set to: ${data.planLevel}`,
        })
        setActivePlan(data.planLevel)
      } else {
        setRazorpayStatus({ type: 'error', text: data.error || 'Webhook simulation failed.' })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error occurred.'
      setRazorpayStatus({ type: 'error', text: message })
    } finally {
      setRazorpayLoading(null)
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

    const cachedDomain = localStorage.getItem('driftlogg_jira_domain')
    const cachedEmail = localStorage.getItem('driftlogg_jira_email')
    const cachedToken = localStorage.getItem('driftlogg_jira_token')
    const cachedProjKey = localStorage.getItem('driftlogg_jira_proj_key')
    
    if (cachedDomain) setJiraDomain(cachedDomain)
    if (cachedEmail) setJiraEmail(cachedEmail)
    if (cachedToken) setJiraToken(cachedToken)
    if (cachedProjKey) setJiraProjKey(cachedProjKey)
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

        {/* Subscription Plan Badge */}
        <div className="flex items-center gap-2.5 rounded-lg border border-dl-m-border bg-dl-card px-4 py-2">
          <CreditCard className="h-4 w-4 text-dl-teal" />
          <span className="text-xs text-dl-muted font-medium uppercase tracking-wider">Active Plan:</span>
          <span className="text-sm font-semibold text-dl-forest">{activePlan}</span>
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

        {/* JIRA Integration */}
        <div className="dl-card flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-dl-teal" />
            <h2 className="card-heading">JIRA REST API Tasks</h2>
          </div>
          <p className="text-[13px] leading-relaxed text-dl-muted">
            Connect your Atlassian account to directly convert decay alerts into JIRA task tickets with full migration details.
          </p>

          <form onSubmit={handleTestJira} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="form-label">JIRA Domain</label>
              <input
                type="url"
                required
                value={jiraDomain}
                onChange={(e) => setJiraDomain(e.target.value)}
                placeholder="https://your-domain.atlassian.net"
                className="dash-input w-full"
              />
            </div>
            <div>
              <label className="form-label">Account Email</label>
              <input
                type="email"
                required
                value={jiraEmail}
                onChange={(e) => setJiraEmail(e.target.value)}
                placeholder="developer@company.com"
                className="dash-input w-full"
              />
            </div>
            <div>
              <label className="form-label">Project Key</label>
              <input
                type="text"
                required
                value={jiraProjKey}
                onChange={(e) => setJiraProjKey(e.target.value)}
                placeholder="PROJ"
                className="dash-input w-full"
              />
            </div>
            <div className="col-span-2">
              <label className="form-label">API Token</label>
              <input
                type="password"
                required
                value={jiraToken}
                onChange={(e) => setJiraToken(e.target.value)}
                placeholder="ATATT3xFf..."
                className="dash-input w-full"
              />
            </div>

            <button
              type="submit"
              disabled={jiraLoading}
              className="btn-dash-primary w-fit col-span-2 flex items-center gap-2"
            >
              {jiraLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              Save & Test JIRA Link
            </button>
          </form>

          {jiraStatus && (
            <div
              className={`flex items-start gap-2 rounded-lg p-3 text-xs leading-relaxed ${
                jiraStatus.type === 'success'
                  ? 'bg-dl-healthy/10 text-dl-healthy border border-dl-healthy/30'
                  : 'bg-dl-critical/10 text-dl-critical border border-dl-critical/30'
              }`}
            >
              {jiraStatus.type === 'success' ? (
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <span className="break-all">{jiraStatus.text}</span>
            </div>
          )}
        </div>

        {/* Razorpay Webhook Sandbox */}
        <div className="dl-card flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-dl-teal" />
            <h2 className="card-heading">Razorpay Billing Webhooks Sandbox</h2>
          </div>
          <p className="text-[13px] leading-relaxed text-dl-muted">
            Fires simulated Razorpay events to your webhook handler `/api/webhooks/razorpay` to test plan upgrading and subscription lifecycle hooks.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSimulateRazorpay('payment.captured')}
              disabled={razorpayLoading !== null}
              className="btn-dash-secondary flex items-center gap-2 py-3"
            >
              {razorpayLoading === 'payment.captured' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4 text-dl-healthy fill-dl-healthy/10" />
              )}
              Upgrade Pro (Captured)
            </button>

            <button
              onClick={() => handleSimulateRazorpay('subscription.charged')}
              disabled={razorpayLoading !== null}
              className="btn-dash-secondary flex items-center gap-2 py-3"
            >
              {razorpayLoading === 'subscription.charged' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4 text-dl-healthy fill-dl-healthy/10" />
              )}
              Upgrade Team (Charged)
            </button>

            <button
              onClick={() => handleSimulateRazorpay('subscription.cancelled')}
              disabled={razorpayLoading !== null}
              className="btn-dash-secondary flex items-center gap-2 py-3"
            >
              {razorpayLoading === 'subscription.cancelled' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4 text-dl-critical fill-dl-critical/10" />
              )}
              Cancel / Downgrade (Cancelled)
            </button>

            <button
              onClick={() => handleSimulateRazorpay('payment.failed')}
              disabled={razorpayLoading !== null}
              className="btn-dash-secondary flex items-center gap-2 py-3"
            >
              {razorpayLoading === 'payment.failed' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4 text-dl-warning fill-dl-warning/10" />
              )}
              Simulate Failure (Failed)
            </button>
          </div>

          {razorpayStatus && (
            <div
              className={`flex items-start gap-2 rounded-lg p-3 text-xs leading-relaxed ${
                razorpayStatus.type === 'success'
                  ? 'bg-dl-healthy/10 text-dl-healthy border border-dl-healthy/30'
                  : 'bg-dl-critical/10 text-dl-critical border border-dl-critical/30'
              }`}
            >
              {razorpayStatus.type === 'success' ? (
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <span>{razorpayStatus.text}</span>
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
