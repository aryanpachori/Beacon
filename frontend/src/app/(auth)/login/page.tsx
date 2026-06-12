'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertCircle, Info, Eye, EyeOff, ArrowRight } from 'lucide-react'
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

function LoginForm() {
  const router = useRouter()
  const redirectTo = useRedirectParam()
  const searchParams = useSearchParams()
  const registerHref = redirectTo
    ? `/register?redirect=${encodeURIComponent(redirectTo)}`
    : '/register'

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

  const sessionExpired = searchParams.get('reason') === 'expired'

  useEffect(() => {
    if (redirectTo) localStorage.setItem('dl_intended_url', redirectTo)
  }, [redirectTo])

  const validateEmail = (val: string) => {
    if (!val) return 'Email is required'
    if (!EMAIL_RE.test(val)) return 'Enter a valid email address'
    return ''
  }

  const validatePassword = (val: string) => {
    if (!val) return 'Password is required'
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
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      })
      setAuthTokens(data.accessToken, data.refreshToken)

      const intended = localStorage.getItem('dl_intended_url')
      localStorage.removeItem('dl_intended_url')

      if (redirectTo || intended) {
        router.push(redirectTo || intended!)
        return
      }

      const step = data.user?.onboardingStep ?? 1
      router.push(step >= 4 ? '/dashboard' : '/onboarding')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        setErrorCode(err.code ?? null)
      } else {
        setError(err instanceof Error ? err.message : 'Sign in failed')
      }
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-1 items-center justify-center px-6 py-12"
    >
      <div className="w-full max-w-[400px]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[26px] font-bold tracking-tight text-[#1e2a3c]">
            Welcome back
          </h1>
          <p className="mt-1.5 text-[14px] text-[#9fa0b5]">
            {redirectTo
              ? 'Sign in to continue'
              : 'Monitor your dependency health.'}
          </p>
        </div>

        {/* Alerts */}
        {sessionExpired && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-[13px] text-blue-700"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            Your session expired. Please sign in again.
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-[13px] text-red-600"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p>{error}</p>
              {errorCode === 'USER_NOT_FOUND' && (
                <Link href={registerHref} className="mt-1 inline-flex items-center gap-1 font-semibold text-[#2f7eda] hover:underline">
                  Create an account <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#555663]" htmlFor="email">
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
                'w-full rounded-xl border bg-white px-4 py-3 text-[14px] text-[#1e2a3c] placeholder:text-[#9fa0b5] outline-none transition-all duration-150',
                emailTouched && emailError
                  ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                  : emailTouched && !emailError && email
                    ? 'border-[#2f7eda] focus:ring-2 focus:ring-[#2f7eda]/15'
                    : 'border-[#c6d1d7] focus:border-[#2f7eda] focus:ring-2 focus:ring-[#2f7eda]/15'
              )}
              autoComplete="email"
            />
            {emailTouched && emailError && <FieldError message={emailError} />}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[12px] font-semibold text-[#555663]" htmlFor="password">
                Password
              </label>
            </div>
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
                placeholder="Your password"
                className={cn(
                  'w-full rounded-xl border bg-white px-4 py-3 pr-11 text-[14px] text-[#1e2a3c] placeholder:text-[#9fa0b5] outline-none transition-all duration-150',
                  passwordTouched && passwordError
                    ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-[#c6d1d7] focus:border-[#2f7eda] focus:ring-2 focus:ring-[#2f7eda]/15'
                )}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9fa0b5] hover:text-[#555663] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordTouched && passwordError && <FieldError message={passwordError} />}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f7eda] py-3 text-[14px] font-semibold text-white shadow-sm transition-all duration-150',
              loading ? 'cursor-not-allowed opacity-70' : 'hover:bg-[#1a5fb4] hover:shadow-md active:scale-[0.99]'
            )}
            style={{ boxShadow: '0 2px 12px rgba(47,126,218,0.35)' }}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 border-t border-[#e4e8ee]" />
          <span className="text-[11px] font-medium text-[#9fa0b5]">NEW HERE?</span>
          <div className="flex-1 border-t border-[#e4e8ee]" />
        </div>

        <p className="mt-4 text-center text-[13px] text-[#9fa0b5]">
          No account?{' '}
          <Link href={registerHref} className="font-semibold text-[#2f7eda] hover:underline">
            Create one for free
          </Link>
        </p>
      </div>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2f7eda] border-t-transparent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
