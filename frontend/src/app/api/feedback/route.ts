import { NextRequest, NextResponse } from 'next/server'

const SLACK_WEBHOOK = process.env.FEEDBACK_SLACK_WEBHOOK ?? ''

export async function POST(req: NextRequest) {
  try {
    if (!SLACK_WEBHOOK) return NextResponse.json({ error: 'Feedback not configured' }, { status: 503 })
    const { message, type, email } = await req.json() as { message: string; type: string; email?: string }
    if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    const emoji = type === 'bug' ? '🐛' : type === 'feature' ? '✨' : '💬'
    const typeLabel = type === 'bug' ? 'Bug Report' : type === 'feature' ? 'Feature Request' : 'General Feedback'

    const slackRes = await fetch(SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: `${emoji} ${typeLabel} — Beacon` },
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*From:*\n${email ?? 'Anonymous'}` },
              { type: 'mrkdwn', text: `*Type:*\n${typeLabel}` },
            ],
          },
          {
            type: 'section',
            text: { type: 'mrkdwn', text: `*Message:*\n${message.trim()}` },
          },
          {
            type: 'context',
            elements: [{ type: 'mrkdwn', text: `Submitted at ${new Date().toISOString()}` }],
          },
        ],
      }),
    })

    if (!slackRes.ok) {
      const body = await slackRes.text()
      console.error(`Slack feedback webhook failed: ${slackRes.status} ${body}`)
      return NextResponse.json({ error: `Slack rejected: ${body}` }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send feedback' }, { status: 500 })
  }
}
