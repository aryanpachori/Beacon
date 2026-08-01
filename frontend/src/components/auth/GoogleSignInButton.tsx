'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { ApiError, apiFetch, setAuthTokens } from '@/lib/api'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          prompt: () => void
        }
      }
    }
  }
}

function GoogleLogo() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  )
}

interface GoogleSignInButtonProps {
  mode: 'login' | 'register'
  redirectTo?: string | null
  onError?: (message: string) => void
}

export function GoogleSignInButton({ mode, redirectTo, onError }: GoogleSignInButtonProps) {
  const router = useRouter()
  const [scriptReady, setScriptReady] = useState(false)
  const initialized = useRef(false)

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!scriptReady || !clientId || !window.google || initialized.current) return
    initialized.current = true

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          const data = await apiFetch<{
            accessToken: string
            refreshToken: string
            user: { onboardingStep?: number }
          }>('/api/auth/google', {
            method: 'POST',
            body: JSON.stringify({ idToken: response.credential }),
          })
          setAuthTokens(data.accessToken, data.refreshToken)

          const intended = localStorage.getItem('dl_intended_url')
          localStorage.removeItem('dl_intended_url')
          router.push(redirectTo || intended || '/dashboard')
        } catch (err) {
          if (err instanceof ApiError) onError?.(err.message)
          else onError?.(err instanceof Error ? err.message : 'Google sign-in failed')
        }
      },
    })
  }, [scriptReady, clientId, redirectTo, router, onError])

  if (!clientId) return null

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <button
        type="button"
        onClick={() => window.google?.accounts.id.prompt()}
        disabled={!scriptReady}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-dl-border bg-dl-bg py-3 text-[13.5px] font-medium text-dl-navy transition-all duration-150 hover:bg-dl-surface disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleLogo />
        {mode === 'register' ? 'Sign up with Google' : 'Sign in with Google'}
      </button>
    </>
  )
}
