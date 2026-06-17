import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { webhookUrl, alert } = await req.json()

    if (!webhookUrl) {
      return NextResponse.json({ error: 'Slack Webhook URL is required.' }, { status: 400 })
    }

    if (!webhookUrl.startsWith('https://hooks.slack.com/')) {
      return NextResponse.json({ error: 'Invalid Slack Webhook URL format.' }, { status: 400 })
    }

    // Format Block Kit message templates for Slack
    const blockKitPayload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🚨 Beacon Health Drop Alert: ${alert.packageName}`,
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Package:* \`${alert.packageName}\`\n*SPS Health Drop:* ~${alert.spsBefore}~ → *${alert.spsAfter}* (${alert.tier.toUpperCase()})\n*Estimated Remediation:* ${alert.effortEstimate?.sprintWeeks || 1} sprint week(s)`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Detected Signals:*\n> ${alert.triggerReason || 'Suspicious release or maintainer inactivity detected.'}`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Survival Breakdown',
              },
              url: `https://beacon.com/packages/${alert.packageId || 'moment'}`,
              style: 'danger',
            },
          ],
        },
      ],
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blockKitPayload),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Slack integration failed: ${text}` }, { status: res.status })
    }

    return NextResponse.json({ success: true, message: 'Slack alert dispatched via Block Kit successfully.' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
