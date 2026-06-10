import crypto from 'node:crypto'
import axios from 'axios'
import Razorpay from 'razorpay'
import { PRO_PLAN_CURRENCY } from '../lib/billing.constants'

let razorpayClient: Razorpay | null = null

function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    throw new Error('Razorpay not configured')
  }
  if (!razorpayClient) {
    razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret })
  }
  return razorpayClient
}

export async function createRazorpayCustomer(params: {
  email: string
  fullName?: string
}): Promise<string | null> {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    console.warn('Razorpay keys not configured — skipping customer creation')
    return null
  }

  try {
    const res = await axios.post(
      'https://api.razorpay.com/v1/customers',
      {
        email: params.email,
        name: params.fullName || params.email,
      },
      {
        auth: { username: keyId, password: keySecret },
      }
    )
    return res.data.id as string
  } catch (err) {
    console.error('Razorpay customer creation failed:', err)
    return null
  }
}

export async function createSubscription(customerId: string, planId: string) {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    throw new Error('Razorpay not configured')
  }

  const res = await axios.post(
    'https://api.razorpay.com/v1/subscriptions',
    {
      plan_id: planId,
      customer_id: customerId,
      total_count: 12,
    },
    { auth: { username: keyId, password: keySecret } }
  )
  return res.data
}

export async function createOrder(amountPaise: number, receipt: string) {
  if (amountPaise < 100) {
    throw new Error('Amount must be at least 100 paise')
  }

  const order = await getRazorpayClient().orders.create({
    amount: amountPaise,
    currency: PRO_PLAN_CURRENCY,
    receipt,
  })

  return {
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
  }
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) return false

  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  return expected === signature
}

export function mapRazorpayError(err: unknown): { status: number; message: string } {
  if (err && typeof err === 'object') {
    const e = err as { statusCode?: number; error?: { description?: string }; message?: string }
    if (e.statusCode === 401) {
      return { status: 401, message: 'Razorpay authentication failed' }
    }
    if (e.statusCode) {
      return {
        status: 500,
        message: e.error?.description || e.message || 'Razorpay order creation failed',
      }
    }
  }
  if (err instanceof Error && err.message.includes('at least 100')) {
    return { status: 400, message: err.message }
  }
  return { status: 500, message: 'Razorpay order creation failed' }
}
