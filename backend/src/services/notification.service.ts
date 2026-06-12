import axios from 'axios'
import { Resend } from 'resend'
import { AlertType } from '@prisma/client'

export interface AlertDispatchParams {
  packageId: string
  packageName: string
  prevSps: number | null
  newSps: number
  tier: string
  prevTier: string | null
  reason: string
  alertType?: AlertType
  cveId?: string
}

export interface OrgIntegration {
  slackEnabled?: boolean
  slackWebhookUrl?: string | null
  gchatEnabled?: boolean
  gchatWebhookUrl?: string | null
  digestEmail?: string | null
}

const tierEmoji: Record<string, string> = {
  critical: '🔴',
  'at-risk': '🟠',
  watch: '🟡',
  healthy: '🟢',
}

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

  if (integration?.digestEmail) {
    promises.push(sendImmediateEmail(integration.digestEmail, params))
  }

  await Promise.allSettled(promises)
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
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: headerText,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Score:* ${params.prevSps} → ${params.newSps}` },
          { type: 'mrkdwn', text: `*Tier:* ${params.prevTier} → ${params.tier}` },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Why:* ${params.reason}` },
      },
      ...(params.cveId
        ? [
            {
              type: 'section',
              text: { type: 'mrkdwn', text: `*Associated CVE:* ${params.cveId}` },
            },
          ]
        : []),
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View package' },
            url: `${process.env.FRONTEND_URL}/packages/${params.packageId}`,
          },
        ],
      },
    ],
  })
}

async function sendGchatAlert(webhookUrl: string, params: AlertDispatchParams) {
  let title = `${params.packageName} needs attention`
  if (params.alertType === AlertType.recovery) {
    title = `${params.packageName} recovered`
  } else if (params.alertType === AlertType.supply_chain) {
    title = `Security Advisory: ${params.packageName}`
  } else if (params.alertType === AlertType.tier_change) {
    title = `${params.packageName} tier change`
  }

  await axios.post(webhookUrl, {
    cardsV2: [
      {
        cardId: `alert-${params.packageId}`,
        card: {
          header: {
            title,
            subtitle: `SPS: ${params.prevSps} → ${params.newSps}`,
          },
          sections: [
            {
              widgets: [
                { textParagraph: { text: params.reason } },
                ...(params.cveId
                  ? [{ textParagraph: { text: `<b>CVE:</b> ${params.cveId}` } }]
                  : []),
                {
                  buttonList: {
                    buttons: [
                      {
                        text: 'View in DriftLogg',
                        onClick: {
                          openLink: {
                            url: `${process.env.FRONTEND_URL}/packages/${params.packageId}`,
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    ],
  })
}

async function sendImmediateEmail(email: string, params: AlertDispatchParams) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const resend = new Resend(apiKey)
  let subject = `DriftLogg Alert: ${params.packageName} (${params.tier})`
  let html = `<p><strong>${params.packageName}</strong> SPS: ${params.prevSps} → ${params.newSps}</p><p>${params.reason}</p>`

  if (params.alertType === AlertType.recovery) {
    subject = `DriftLogg Recovery Alert: ${params.packageName} recovered to ${params.tier}`
    html = `<p><strong>${params.packageName}</strong> has recovered to ${params.tier} tier (SPS: ${params.prevSps} → ${params.newSps}).</p><p>${params.reason}</p>`
  } else if (params.alertType === AlertType.tier_change) {
    subject = `DriftLogg Tier Change Alert: ${params.packageName} tier changed to ${params.tier}`
    html = `<p><strong>${params.packageName}</strong> has worsened to ${params.tier} tier (SPS: ${params.prevSps} → ${params.newSps}).</p><p>${params.reason}</p>`
  } else if (params.alertType === AlertType.supply_chain) {
    subject = `DriftLogg Security Alert: CVE / Supply Chain Advisory for ${params.packageName}`
    html = `<p><strong>${params.packageName}</strong> is affected by a security advisory / CVE override (${params.cveId || 'No CVE ID'}).</p><p>${params.reason}</p>`
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'alerts@driftlogg.com',
    to: email,
    subject,
    html,
  })
}

export async function sendSlackTest(webhookUrl: string): Promise<void> {
  await axios.post(webhookUrl, {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*DriftLogg Test Alert*\nYour Slack integration is working.',
        },
      },
    ],
  })
}

export async function sendGchatTest(webhookUrl: string): Promise<void> {
  await axios.post(webhookUrl, {
    cardsV2: [
      {
        cardId: 'driftlogg-test',
        card: {
          header: { title: 'DriftLogg Test Alert' },
          sections: [
            {
              widgets: [
                { textParagraph: { text: 'Your Google Chat integration is working.' } },
              ],
            },
          ],
        },
      },
    ],
  })
}

export function generateNotificationMessage(
  packageName: string,
  tier: string,
  alertType?: AlertType
): string {
  if (alertType === AlertType.recovery) {
    return `${packageName} health recovered to ${tier} tier`
  }
  if (alertType === AlertType.supply_chain) {
    return `Security advisory: CVE override alert for ${packageName}`
  }
  if (alertType === AlertType.tier_change) {
    return `${packageName} tier worsened to ${tier}`
  }
  return `${packageName} health dropped to ${tier} tier`
}
