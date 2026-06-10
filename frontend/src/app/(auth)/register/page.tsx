'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { ApiError, apiFetch, setAuthTokens } from '@/lib/api'
import { cn } from '@/lib/utils'

const FULL_NAME_MAX = 50
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

  const [fullName, setFullName] = useState('')
  const [nickname, setNickname] = useState('')
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
          fullName: fullName.trim() || undefined,
          nickname: nickname.trim() || undefined,
        }),
      })
      setAuthTokens(data.accessToken, data.refreshToken)

      if (redirectTo) {
        router.push(redirectTo)
        return
      }

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

  const nameCount = fullName.length
  const nameCountColor =
    nameCount >= FULL_NAME_MAX
      ? 'text-dl-danger'
      : nameCount >= 40
        ? 'text-dl-warning'
        : 'text-dl-hint'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-1 items-center justify-center px-4 py-10"
    >
      <div className="w-full max-w-sm">
        <div className="dl-card p-6 shadow-sm md:p-8">
          <h1 className="marketing-title mb-1 text-[22px] md:text-[24px]">Create account</h1>
          <p className="marketing-subtitle mb-6">
            Start monitoring your package health in minutes.
          </p>

          {planParam === 'pro' && (
            <div className="mb-4 rounded-lg border border-dl-teal/30 bg-dl-teal/5 px-3 py-2.5 text-[13px] text-dl-teal">
              You&apos;re signing up for <strong>Pro</strong> — you&apos;ll pick up billing after onboarding.
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-dl-danger/30 bg-dl-danger/10 p-3 text-[13px] text-dl-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p>{error}</p>
                {errorCode === 'EMAIL_EXISTS' && (
                  <Link
                    href={loginHref}
                    className="mt-1 inline-block font-medium text-dl-teal hover:underline"
                  >
                    Sign in instead →
                  </Link>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-dl-m-muted" htmlFor="fullName">
                  Full name
                </label>
                <span className={cn('text-[11px] tabular-nums', nameCountColor)}>
                  {nameCount} / {FULL_NAME_MAX}
                </span>
              </div>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value.slice(0, FULL_NAME_MAX))}
                placeholder="Aryan Pachori"
                className="form-input"
                autoComplete="name"
                maxLength={FULL_NAME_MAX}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="nickname">
                Nickname / handle
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="dev-handle"
                className="form-input"
                pattern="[a-zA-Z0-9._-]*"
                autoComplete="nickname"
              />
            </div>

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
              {emailTouched && emailError ? (
                <FieldError message={emailError} />
              ) : !emailTouched ? (
                <p className="mt-1 text-[11px] text-dl-hint">
                  We&apos;ll send a confirmation to this address
                </p>
              ) : null}
            </div>

            <div>
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
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
                  'form-input',
                  passwordTouched && passwordError && 'border-dl-danger focus:ring-dl-danger/20',
                  passwordTouched && !passwordError && password && 'border-dl-teal',
                )}
                required
                minLength={8}
                autoComplete="new-password"
              />
              {passwordTouched && passwordError ? (
                <FieldError message={passwordError} />
              ) : (
                <p className="mt-1 text-[11px] text-dl-hint">
                  At least 8 characters, 1 number recommended
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'btn-primary mt-1 w-full min-w-[160px] justify-center py-2.5',
                loading && 'cursor-not-allowed opacity-70'
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-dl-m-muted">
          Already have an account?{' '}
          <Link href={loginHref} className="font-medium text-dl-teal hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center px-4 py-10 text-sm text-dl-muted">
          Loading…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
