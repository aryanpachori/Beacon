'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertCircle, Info, Eye, EyeOff } from 'lucide-react'
import { ApiError, apiFetch, setAuthTokens } from '@/lib/api'
import { cn } from '@/lib/utils'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { SiteLogo } from '@/components/layout/SiteLogo'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INK = '#08090a'
const MUTED = 'rgba(8,9,10,.55)'
const BORDER = 'rgba(8,9,10,.14)'
const HEADING = 'var(--font-instrument-serif), Georgia, serif'

function useRedirectParam(): string | null {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  return redirect && redirect.startsWith('/') ? redirect : null
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[#c4675c]">
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
    // Clear any deep-link return URL so login always lands on Overview.
    localStorage.removeItem('dl_intended_url')
  }, [])

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
      localStorage.removeItem('dl_intended_url')
      router.push('/dashboard')
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

  const inputClass = (touched: boolean, fieldError: string, value: string) =>
    cn(
      'w-full rounded-lg border bg-white px-4 py-3 text-[14px] outline-none transition-all duration-150',
      'placeholder:text-[rgba(8,9,10,.38)]',
      touched && fieldError
        ? 'border-[#c4675c] focus:border-[#c4675c] focus:ring-2 focus:ring-[#c4675c]/15'
        : touched && !fieldError && value
          ? 'border-[rgba(8,9,10,.35)] focus:border-[#08090a] focus:ring-2 focus:ring-[rgba(8,9,10,.08)]'
          : 'focus:border-[#08090a] focus:ring-2 focus:ring-[rgba(8,9,10,.08)]',
    )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-1 items-center justify-center px-6 py-16"
    >
      <div className="w-full max-w-[380px]">
        <div className="mb-10 flex justify-center">
          <SiteLogo
            size={36}
            wordmarkClassName="text-[22px] font-semibold tracking-[-0.02em] text-[#08090a]"
            className="gap-2.5"
          />
        </div>

        <div className="mb-8 text-center">
          <h1
            className="text-[34px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#08090a]"
            style={{ fontFamily: HEADING }}
          >
            Welcome back
          </h1>
          <p
            className="mt-2 text-[15px]"
            style={{ color: MUTED, fontFamily: HEADING }}
          >
            Sign in to continue
          </p>
        </div>

        {sessionExpired && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-start gap-2.5 rounded-lg border border-[rgba(8,9,10,.12)] bg-[rgba(8,9,10,.03)] p-3.5 text-[13px]"
            style={{ color: MUTED }}
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: INK }} />
            Your session expired. Please sign in again.
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-start gap-2.5 rounded-lg border border-[#c4675c]/30 bg-[#c4675c]/08 p-3.5 text-[13px] text-[#c4675c]"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p>{error}</p>
              {errorCode === 'USER_NOT_FOUND' && (
                <Link
                  href={registerHref}
                  className="mt-1 inline-block font-medium underline underline-offset-2"
                  style={{ color: INK, fontFamily: HEADING }}
                >
                  Create an account
                </Link>
              )}
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="mb-1.5 block text-[12px] font-semibold text-[#08090a]"
              htmlFor="email"
            >
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
              onBlur={() => {
                setEmailTouched(true)
                setEmailError(validateEmail(email))
              }}
              placeholder="you@company.com"
              className={inputClass(emailTouched, emailError, email)}
              style={{
                color: INK,
                borderColor: emailTouched && emailError ? undefined : BORDER,
              }}
              autoComplete="email"
            />
            {emailTouched && emailError && <FieldError message={emailError} />}
          </div>

          <div>
            <label
              className="mb-1.5 block text-[12px] font-semibold text-[#08090a]"
              htmlFor="password"
            >
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
                placeholder="Your password"
                className={cn(inputClass(passwordTouched, passwordError, password), 'pr-11')}
                style={{
                  color: INK,
                  borderColor: passwordTouched && passwordError ? undefined : BORDER,
                }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:text-[#08090a]"
                style={{ color: MUTED }}
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
              'mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-[#08090a] py-3 text-[14px] font-medium text-white transition-all duration-150',
              loading
                ? 'cursor-not-allowed opacity-70'
                : 'hover:bg-[#08090a]/90 active:scale-[0.99]',
            )}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Signing in…
              </>
            ) : (
              'Sign in →'
            )}
          </button>
        </form>

        <div className="mt-7 flex items-center gap-4">
          <div className="h-px flex-1" style={{ background: BORDER }} />
          <span
            className="text-[11px] font-medium uppercase tracking-[0.06em]"
            style={{ color: MUTED }}
          >
            OR
          </span>
          <div className="h-px flex-1" style={{ background: BORDER }} />
        </div>

        <div className="mt-5">
          <GoogleSignInButton
            mode="login"
            redirectTo={redirectTo}
            onError={(message) => setError(message)}
            className="rounded-lg border-[rgba(8,9,10,.14)] bg-white py-3 text-[13.5px] font-medium text-[#08090a] hover:bg-[rgba(8,9,10,.03)]"
          />
        </div>

        <div className="mt-7 flex items-center gap-4">
          <div className="h-px flex-1" style={{ background: BORDER }} />
          <span
            className="text-[11px] font-medium uppercase tracking-[0.06em]"
            style={{ color: MUTED }}
          >
            NEW HERE?
          </span>
          <div className="h-px flex-1" style={{ background: BORDER }} />
        </div>

        <p
          className="mt-5 text-center text-[14px]"
          style={{ color: MUTED, fontFamily: HEADING }}
        >
          No account?{' '}
          <Link
            href={registerHref}
            className="font-semibold text-[#08090a] underline underline-offset-[3px] transition-opacity hover:opacity-70"
          >
            Create one for free
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
        <div className="flex flex-1 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#08090a] border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
