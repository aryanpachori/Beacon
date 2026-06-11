'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertCircle, Info } from 'lucide-react'
import { ApiError, apiFetch, setAuthTokens } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function useRedirectParam(): string | null {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  return redirect && redirect.startsWith('/') ? redirect : null
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] text-dl-danger">
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

  // Save intended URL before redirect
  useEffect(() => {
    if (redirectTo) {
      localStorage.setItem('dl_intended_url', redirectTo)
    }
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-1 items-center justify-center px-4 py-10"
    >
      <div className="w-full max-w-sm">
        <div className="dl-card p-6 shadow-sm md:p-8">
          <h1 className="marketing-title mb-1 text-[22px] md:text-[24px]">Sign in</h1>
          <p className="marketing-subtitle mb-6">
            {redirectTo
              ? 'Sign in to continue to Dashboard'
              : 'Know which packages are dying before they do.'}
          </p>

          {sessionExpired && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-blue-400/20 bg-blue-400/5 p-3 text-[13px] text-blue-300">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              Your session expired. Please sign in again.
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-dl-danger/30 bg-dl-danger/10 p-3 text-[13px] text-dl-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p>{error}</p>
                {errorCode === 'USER_NOT_FOUND' && (
                  <Link
                    href={registerHref}
                    className="mt-1 inline-block font-medium text-dl-teal hover:underline"
                  >
                    Create an account →
                  </Link>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailTouched) setEmailError(validateEmail(e.target.value))
                }}
                onBlur={() => {
                  setEmailTouched(true)
                  setEmailError(validateEmail(email))
                }}
                placeholder="you@company.com"
                className={cn(
                  'form-input',
                  emailTouched && emailError && 'border-dl-danger focus:ring-dl-danger/20',
                  emailTouched && !emailError && email && 'border-dl-teal',
                )}
                required
                autoComplete="email"
              />
              {emailTouched && emailError && <FieldError message={emailError} />}
            </div>

            <div>
              <label className="form-label" htmlFor="password">
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
                  onBlur={() => {
                    setPasswordTouched(true)
                    setPasswordError(validatePassword(password))
                  }}
                  placeholder="Min. 8 characters"
                  className={cn(
                    'form-input pr-10',
                    passwordTouched && passwordError && 'border-dl-danger focus:ring-dl-danger/20',
                  )}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dl-hint hover:text-dl-forest"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
              {passwordTouched && passwordError && <FieldError message={passwordError} />}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'btn-primary mt-1 w-full min-w-[120px] justify-center py-2.5',
                loading && 'cursor-not-allowed opacity-70'
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-dl-m-muted">
          No account?{' '}
          <Link href={registerHref} className="font-medium text-dl-teal hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center px-4 py-10 text-sm text-dl-muted">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
