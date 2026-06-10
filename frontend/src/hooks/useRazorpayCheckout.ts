'use client'

import { useCallback, useState } from 'react'
import { createBillingOrder, verifyBillingPayment } from '@/lib/api'
import { PRO_PLAN_AMOUNT_PAISE } from '@/lib/billing'

const CHECKOUT_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Not in browser'))
  if (window.Razorpay) return Promise.resolve()

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SCRIPT}"]`)
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')))
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = CHECKOUT_SCRIPT
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'))
    document.body.appendChild(script)
  })
}

type CheckoutOptions = {
  email?: string
  name?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function useRazorpayCheckout() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCheckout = useCallback(async (options?: CheckoutOptions) => {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    if (!keyId) {
      setError('Payment is not configured. Contact support.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await loadRazorpayScript()
      const order = await createBillingOrder(PRO_PLAN_AMOUNT_PAISE)

      if (!window.Razorpay) {
        throw new Error('Razorpay checkout failed to initialize')
      }

      const rzp = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'DriftLogg',
        description: 'Pro plan — monthly',
        order_id: order.order_id,
        prefill: {
          email: options?.email,
          name: options?.name,
        },
        theme: { color: '#35858E' },
        handler: async (response) => {
          try {
            await verifyBillingPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            options?.onSuccess?.()
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment verification failed')
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            options?.onCancel?.()
          },
        },
      })

      rzp.on('payment.failed', (response) => {
        setLoading(false)
        setError(response.error?.description || 'Payment failed')
      })

      rzp.open()
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Could not start checkout')
    }
  }, [])

  return { startCheckout, loading, error, clearError: () => setError(null) }
}
