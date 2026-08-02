'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/api'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard')
    } else {
      setCheckingAuth(false)
    }
  }, [router])

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-[#08090a]/55">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#08090a] border-t-transparent" />
          <span>Verifying session…</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-white text-[#08090a]"
      style={{ colorScheme: 'light' }}
    >
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}
