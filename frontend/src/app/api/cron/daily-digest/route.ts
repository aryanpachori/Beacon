import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

async function handleRequest() {
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

export async function GET() {
  return handleRequest()
}

export async function POST() {
  return handleRequest()
}
