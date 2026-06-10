'use client'

import Link from 'next/link'
import { useRazorpayCheckout } from '@/hooks/useRazorpayCheckout'
import { formatInr, PRO_PLAN_PRICE_INR } from '@/lib/billing'

type RazorpayUpgradeButtonProps = {
  email?: string
  name?: string
  label?: string
  className?: string
  onSuccess?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
}

export function RazorpayUpgradeButton({
  email,
  name,
  label = `Upgrade to Pro — ${formatInr(PRO_PLAN_PRICE_INR)}/mo`,
  className = '',
  onSuccess,
  disabled = false,
  variant = 'primary',
}: RazorpayUpgradeButtonProps) {
  const { startCheckout, loading, error, clearError } = useRazorpayCheckout()

  const variantClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'secondary'
        ? 'btn-secondary'
        : 'rounded-lg border border-dl-m-border bg-transparent px-4 py-2 text-[12px] font-semibold text-dl-forest transition-all hover:bg-white/5'

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => {
          clearError()
          void startCheckout({ email, name, onSuccess })
        }}
        className={`${variantClass} ${className} disabled:opacity-60`}
      >
        {loading ? 'Opening checkout…' : label}
      </button>
      {error && (
        <p className="text-[12px] text-dl-critical" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

/** For public pages: sign in first, then Razorpay checkout on /billing */
export function ProCheckoutLink({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const checkoutRedirect = '/billing?upgrade=pro'
  return (
    <Link
      href={`/login?redirect=${encodeURIComponent(checkoutRedirect)}`}
      className={className}
    >
      {children}
    </Link>
  )
}

export function ProRegisterLink({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const checkoutRedirect = '/billing?upgrade=pro'
  return (
    <Link
      href={`/register?redirect=${encodeURIComponent(checkoutRedirect)}`}
      className={className}
    >
      {children}
    </Link>
  )
}
