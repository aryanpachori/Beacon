import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

/**
 * Proxy to the backend digest cron endpoint.
 * The actual sending (SMTP via nodemailer) happens in the backend digest.service.ts.
 */
async function handleRequest(req: NextRequest) {
  try {
    const secret = process.env.INTERNAL_WEBHOOK_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'INTERNAL_WEBHOOK_SECRET not configured' }, { status: 500 })
    }

    const res = await fetch(`${API_URL}/api/internal/trigger-digest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': secret,
      },
      body: JSON.stringify({}),
    })

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return handleRequest(req)
}

export async function POST(req: NextRequest) {
  return handleRequest(req)
}
