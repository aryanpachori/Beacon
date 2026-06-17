import axios from 'axios'
import { AlertType } from '@prisma/client'
import { sendMail, FOUNDER_EMAILS } from '../lib/mailer'
import { buildAlertEmail } from '../lib/emailTemplates'

export interface AlertDispatchParams {
  packageId: string
  packageName: string
  ecosystem?: string
  prevSps: number | null
  newSps: number
  tier: string
  prevTier: string | null
  reason: string
  alertType?: AlertType
  cveId?: string
  signals?: Record<string, number>
}

export interface OrgIntegration {
  slackEnabled?: boolean
  slackWebhookUrl?: string | null
  gchatEnabled?: boolean
  gchatWebhookUrl?: string | null
  digestEmail?: string | null
}

const tierEmoji: Record<string, string> = {
  critical:  '🔴',
  'at-risk': '🟠',
  'at_risk': '🟠',
  watch:     '🟡',
  healthy:   '🟢',
}

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'https://beaconapp.dev'

export async function dispatchChannels(
  integration: OrgIntegration | null,
  params: AlertDispatchParams
): Promise<void> {
  const promises: Promise<unknown>[] = []

  if (integration?.slackEnabled && integration.slackWebhookUrl) {
    promises.push(sendSlackAlert(integration.slackWebhookUrl, params))
  }

  if (integration?.gchatEnabled && integration.gchatWebhookUrl) {
    promises.push(sendGchatAlert(integration.gchatWebhookUrl, params))
  }

  // Always send alert email — to org's configured address + the three founders
  promises.push(sendAlertEmail(integration?.digestEmail ?? null, params))

  await Promise.allSettled(promises)
}

async function sendAlertEmail(orgEmail: string | null, params: AlertDispatchParams): Promise<void> {
  const alertType = (params.alertType ?? AlertType.threshold) as
    'threshold' | 'tier_change' | 'recovery' | 'supply_chain'

  const { subject, html } = buildAlertEmail({
    packageName: params.packageName,
    ecosystem: params.ecosystem ?? 'npm',
    prevSps: params.prevSps,
    newSps: params.newSps,
    tier: params.tier,
    prevTier: params.prevTier,
    reason: params.reason,
    alertType,
    cveId: params.cveId,
    packageUrl: `${FRONTEND_URL}/packages/${params.packageId}`,
    signals: params.signals,
  })

  const to = orgEmail ? [orgEmail, ...FOUNDER_EMAILS] : FOUNDER_EMAILS
  await sendMail({ to, subject, html })
}

async function sendSlackAlert(webhookUrl: string, params: AlertDispatchParams) {
  const emoji = tierEmoji[params.tier] ?? '⚠️'
  let headerText = `${emoji} ${params.packageName} — SPS dropped to ${params.newSps}`
  if (params.alertType === AlertType.recovery) {
    headerText = `${emoji} ${params.packageName} — SPS recovered to ${params.newSps}`
  } else if (params.alertType === AlertType.tier_change) {
    headerText = `${emoji} ${params.packageName} — Tier worsened to ${params.tier}`
  } else if (params.alertType === AlertType.supply_chain) {
    headerText = `🚨 CVE / Supply Chain Alert for ${params.packageName}`
  }

  await axios.post(webhookUrl, {
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: headerText } },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Score:* ${params.prevSps} → ${params.newSps}` },
          { type: 'mrkdwn', text: `*Tier:* ${params.prevTier} → ${params.tier}` },
        ],
      },
      { type: 'section', text: { type: 'mrkdwn', text: `*Why:* ${params.reason}` } },
      ...(params.cveId
        ? [{ type: 'section', text: { type: 'mrkdwn', text: `*CVE:* ${params.cveId}` } }]
        : []),
      {
        type: 'actions',
        elements: [{
          type: 'button',
          text: { type: 'plain_text', text: 'View package' },
          url: `${FRONTEND_URL}/packages/${params.packageId}`,
        }],
      },
    ],
  })
}

async function sendGchatAlert(webhookUrl: string, params: AlertDispatchParams) {
  let title = `${params.packageName} needs attention`
  if (params.alertType === AlertType.recovery) title = `${params.packageName} recovered`
  else if (params.alertType === AlertType.supply_chain) title = `Security Advisory: ${params.packageName}`
  else if (params.alertType === AlertType.tier_change) title = `${params.packageName} tier change`

  await axios.post(webhookUrl, {
    cardsV2: [{
      cardId: `alert-${params.packageId}`,
      card: {
        header: { title, subtitle: `SPS: ${params.prevSps} → ${params.newSps}` },
        sections: [{
          widgets: [
            { textParagraph: { text: params.reason } },
            ...(params.cveId ? [{ textParagraph: { text: `<b>CVE:</b> ${params.cveId}` } }] : []),
            {
              buttonList: {
                buttons: [{
                  text: 'View in Beacon',
                  onClick: { openLink: { url: `${FRONTEND_URL}/packages/${params.packageId}` } },
                }],
              },
            },
          ],
        }],
      },
    }],
  })
}

export async function sendSlackTest(webhookUrl: string): Promise<void> {
  await axios.post(webhookUrl, {
    blocks: [{
      type: 'section',
      text: { type: 'mrkdwn', text: '*Beacon Test Alert*\nYour Slack integration is working.' },
    }],
  })
}

export async function sendGchatTest(webhookUrl: string): Promise<void> {
  await axios.post(webhookUrl, {
    cardsV2: [{
      cardId: 'beacon-test',
      card: {
        header: { title: 'Beacon Test Alert' },
        sections: [{
          widgets: [{ textParagraph: { text: 'Your Google Chat integration is working.' } }],
        }],
      },
    }],
  })
}

export function generateNotificationMessage(
  packageName: string,
  tier: string,
  alertType?: AlertType
): string {
  if (alertType === AlertType.recovery) return `${packageName} health recovered to ${tier} tier`
  if (alertType === AlertType.supply_chain) return `Security advisory: CVE override alert for ${packageName}`
  if (alertType === AlertType.tier_change) return `${packageName} tier worsened to ${tier}`
  return `${packageName} health dropped to ${tier} tier`
}
