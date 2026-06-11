'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ApiError, apiFetch, setAuthTokens } from '@/lib/api'
import { Eye, EyeOff } from 'lucide-react'

function useRedirectParam(): string | null {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  return redirect && redirect.startsWith('/') ? redirect : null
}

function RegisterForm() {
  const router = useRouter()
  const redirectTo = useRedirectParam()
  const loginHref = redirectTo
    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
    : '/login'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

          {error && (
            <div className="mb-4 rounded-lg bg-dl-critical/10 px-3 py-2 text-sm text-dl-critical">
              <p>{error}</p>
              {errorCode === 'EMAIL_EXISTS' && (
                <Link
                  href={loginHref}
                  className="mt-2 inline-block font-medium text-dl-teal hover:underline"
                >
                  Sign in instead →
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="form-label" htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="form-input"
                autoComplete="name"
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="form-input"
                required
                autoComplete="email"
              />
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
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="form-input pr-10"
                  required
                  minLength={8}
                  autoComplete="new-password"
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
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-1 w-full justify-center py-2.5 disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create account'}
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
