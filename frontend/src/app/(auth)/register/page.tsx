'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertCircle, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import { ApiError, apiFetch, setAuthTokens } from '@/lib/api'
import { cn } from '@/lib/utils'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function useRedirectParam(): string | null {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  return redirect && redirect.startsWith('/') ? redirect : null
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-red-500">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Capital letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Symbol', pass: /[^A-Za-z0-9]/.test(password) },
  ]
  if (!password) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {checks.map(({ label, pass }) => (
        <span key={label} className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors',
          pass ? 'bg-green-50 text-green-600' : 'bg-dl-surface text-dl-muted'
        )}>
          <CheckCircle2 className={cn('h-2.5 w-2.5', pass ? 'text-green-500' : 'text-[rgba(255,255,255,0.2)]')} />
          {label}
        </span>
      ))}
    </div>
  )
}

function RegisterForm() {
  const router = useRouter()
  const redirectTo = useRedirectParam()
  const loginHref = redirectTo
    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
    : '/login'

  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailError, setEmailError] = useState('')

  const [password, setPassword] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const planParam = useSearchParams().get('plan')

  const validateEmail = (val: string) => {
    if (!val) return 'Email is required'
    if (!EMAIL_RE.test(val)) return 'Enter a valid email address'
    return ''
  }

  const validatePassword = (val: string) => {
    if (!val) return 'Password is required'
    if (val.length < 8) return 'Password must be at least 8 characters'
    const missing = []
    if (!/[A-Z]/.test(val)) missing.push('a capital letter')
    if (!/[0-9]/.test(val)) missing.push('a number')
    if (!/[^A-Za-z0-9]/.test(val)) missing.push('a symbol')
    if (missing.length) return `Add ${missing.join(', ')}`
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const eErr = validateEmail(email)
    const pErr = validatePassword(password)
    setEmailError(eErr)
    setPasswordError(pErr)
    setEmailTouched(true)
    setPasswordTouched(true)
    if (eErr || pErr) return

    setError('')
    setErrorCode(null)
    setLoading(true)
    try {
      const data = await apiFetch<{
        accessToken: string
        refreshToken: string
        user: { onboardingStep?: number }
      }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })
      setAuthTokens(data.accessToken, data.refreshToken)
      router.push('/onboarding')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        setErrorCode(err.code ?? null)
      } else {
        setError(err instanceof Error ? err.message : 'Registration failed')
      }
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-1 items-center justify-center px-6 py-10"
    >
      <div className="w-full max-w-[400px]">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-[26px] font-bold tracking-tight text-dl-navy">
            Create account
          </h1>
          <p className="mt-1.5 text-[14px] text-dl-muted">
            Start monitoring your package health in minutes.
          </p>
        </div>

        {planParam === 'pro' && (
          <div className="mb-5 rounded-xl border border-[#ff6600]/25 bg-[rgba(111,211,154,0.08)] px-4 py-3 text-[13px] font-medium text-[#ff6600]">
            You&apos;re signing up for <strong>Pro</strong> — billing starts after onboarding.
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-[13px] text-red-600"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p>{error}</p>
              {errorCode === 'EMAIL_EXISTS' && (
                <Link href={loginHref} className="mt-1 inline-flex items-center gap-1 font-semibold text-[#ff6600] hover:underline">
                  Sign in instead <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-dl-text" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailTouched) setEmailError(validateEmail(e.target.value))
              }}
              onBlur={() => { setEmailTouched(true); setEmailError(validateEmail(email)) }}
              placeholder="you@company.com"
              className={cn(
                'w-full rounded-xl border bg-dl-bg px-4 py-3 text-[14px] text-dl-navy placeholder:text-dl-muted outline-none transition-all duration-150',
                emailTouched && emailError
                  ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                  : emailTouched && !emailError && email
                    ? 'border-[#ff6600] focus:ring-2 focus:ring-[#ff6600]/15'
                    : 'border-dl-border focus:border-dl-blue focus:ring-2 focus:ring-dl-blue/15'
              )}
              autoComplete="email"
            />
            {emailTouched && emailError && <FieldError message={emailError} />}
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-dl-text" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (passwordTouched) setPasswordError(validatePassword(e.target.value))
                }}
                onBlur={() => { setPasswordTouched(true); setPasswordError(validatePassword(password)) }}
                placeholder="Create a strong password"
                className={cn(
                  'w-full rounded-xl border bg-dl-bg px-4 py-3 pr-11 text-[14px] text-dl-navy placeholder:text-dl-muted outline-none transition-all duration-150',
                  passwordTouched && passwordError
                    ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : passwordTouched && !passwordError && password
                      ? 'border-[#ff6600] focus:ring-2 focus:ring-[#ff6600]/15'
                      : 'border-dl-border focus:border-dl-blue focus:ring-2 focus:ring-dl-blue/15'
                )}
                autoComplete="new-password"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dl-muted hover:text-dl-text transition-colors"
                aria-label={showPassword ? 'Hide' : 'Show'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordTouched && passwordError
              ? <FieldError message={passwordError} />
              : <PasswordStrength password={password} />
            }
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6600] py-3 text-[14px] font-semibold text-[#0b0a08] transition-all duration-150',
              loading ? 'cursor-not-allowed opacity-70' : 'hover:bg-[#e55c00] hover:shadow-md active:scale-[0.99]'
            )}
            style={{ boxShadow: '0 2px 12px rgba(79,97,40,0.35)' }}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating account…
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-dl-muted">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="font-medium text-dl-text hover:underline">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="font-medium text-dl-text hover:underline">Privacy Policy</Link>.
        </p>

        <div className="mt-5 flex items-center gap-4">
          <div className="flex-1 border-t border-[#e4e8ee]" />
          <span className="text-[11px] font-medium text-dl-muted">HAVE AN ACCOUNT?</span>
          <div className="flex-1 border-t border-[#e4e8ee]" />
        </div>

        <p className="mt-4 text-center text-[13px] text-dl-muted">
          <Link href={loginHref} className="font-semibold text-[#ff6600] hover:underline">
            Sign in instead
          </Link>
        </p>
      </div>
    </motion.div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#ff6600] border-t-transparent" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
