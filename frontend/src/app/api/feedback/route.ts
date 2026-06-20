import { NextRequest, NextResponse } from 'next/server'

const SLACK_WEBHOOK = 'https://hooks.slack.com/services/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'

export async function POST(req: NextRequest) {
  try {
    const { message, type, email } = await req.json() as { message: string; type: string; email?: string }
    if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    const emoji = type === 'bug' ? '🐛' : type === 'feature' ? '✨' : '💬'
    const typeLabel = type === 'bug' ? 'Bug Report' : type === 'feature' ? 'Feature Request' : 'General Feedback'

    await fetch(SLACK_WEBHOOK, {
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

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send feedback' }, { status: 500 })
  }
}
