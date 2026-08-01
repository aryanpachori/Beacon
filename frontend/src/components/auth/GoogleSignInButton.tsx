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
          renderButton: (
            parent: HTMLElement,
            options: { theme: string; size: string; width: string | number; text?: string }
          ) => void
        }
      }
    }
  }
}

interface GoogleSignInButtonProps {
  mode: 'login' | 'register'
  redirectTo?: string | null
  onError?: (message: string) => void
}

export function GoogleSignInButton({ mode, redirectTo, onError }: GoogleSignInButtonProps) {
  const router = useRouter()
  const buttonRef = useRef<HTMLDivElement>(null)
  const [scriptReady, setScriptReady] = useState(false)

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!scriptReady || !clientId || !buttonRef.current || !window.google) return

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

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      width: '100%',
      text: mode === 'register' ? 'signup_with' : 'signin_with',
    })
  }, [scriptReady, clientId, mode, redirectTo, router, onError])

  if (!clientId) return null

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={buttonRef} className="flex w-full justify-center" />
    </>
  )
}
