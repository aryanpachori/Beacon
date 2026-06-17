import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'beacon_secret_123'
    const signature = req.headers.get('x-razorpay-signature')
    const rawBody = await req.text()

    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex')

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Signature verification failed.' }, { status: 400 })
      }
    }

    const payload = JSON.parse(rawBody)
    const event = payload.event

    let planLevel = 'Starter' // Default
    let statusMessage = 'Unhandled event.'

    switch (event) {
      case 'payment.captured':
        planLevel = 'Pro'
        statusMessage = 'Subscription payment captured. Upgraded to Pro Plan.'
        break
      case 'subscription.charged':
        planLevel = 'Pro'
        statusMessage = 'Subscription payment charged. Upgraded to Pro Plan.'
        break
      case 'subscription.cancelled':
        planLevel = 'Starter'
        statusMessage = 'Subscription cancelled. Downgraded to Starter Plan.'
        break
      case 'payment.failed':
        statusMessage = 'Payment failed. Access retained, notifying admin.'
        // Note: Keep plan level unchanged or downgrade depending on business logic
        planLevel = 'Starter'
        break
    }

    const response = NextResponse.json({
      success: true,
      event,
      planLevel,
      message: statusMessage,
    })

    // Set cookie valid for 7 days so client dashboard reflects new tier instantly
    response.cookies.set('beacon_plan', planLevel, { path: '/', maxAge: 60 * 60 * 24 * 7 })
    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
