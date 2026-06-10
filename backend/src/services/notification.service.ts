import axios from 'axios'
import { Resend } from 'resend'

export interface AlertDispatchParams {
  packageId: string
  packageName: string
  prevSps: number | null
  newSps: number
  tier: string
  prevTier: string | null
  reason: string
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
  await axios.post(webhookUrl, {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} ${params.packageName} — SPS dropped to ${params.newSps}`,
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
  await axios.post(webhookUrl, {
    cardsV2: [
      {
        cardId: `alert-${params.packageId}`,
        card: {
          header: {
            title: `${params.packageName} needs attention`,
            subtitle: `SPS: ${params.prevSps} → ${params.newSps}`,
          },
          sections: [
            {
              widgets: [
                { textParagraph: { text: params.reason } },
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
  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'alerts@driftlogg.com',
    to: email,
    subject: `DriftLogg Alert: ${params.packageName} (${params.tier})`,
    html: `<p><strong>${params.packageName}</strong> SPS: ${params.prevSps} → ${params.newSps}</p><p>${params.reason}</p>`,
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

export function generateNotificationMessage(packageName: string, tier: string): string {
  return `${packageName} health dropped to ${tier} tier`
}
