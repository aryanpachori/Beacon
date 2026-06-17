'use client'

import { useState, useEffect, useCallback } from 'react'
import { Shield, TrendingDown, Bell, Zap, Sun, Moon, Lightbulb, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { useTheme } from '@/hooks/useTheme'
import { isAuthenticated } from '@/lib/api'

function useFunFact() {
  const [fact, setFact] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random')
      const data = await res.json()
      setFact(data.text ?? null)
    } catch {
      setFact(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  return { fact, loading, refresh: fetch_ }
}

const FEATURES = [
  { icon: TrendingDown, text: 'Predict package death up to 60 days early' },
  { icon: Shield,       text: 'CVE & supply chain alerts in real-time' },
  { icon: Bell,         text: 'Slack & Google Chat notifications' },
  { icon: Zap,          text: 'XGBoost-powered SPS scoring engine' },
]

const STATS = [
  { value: '500+', label: 'packages monitored' },
  { value: '60d',  label: 'prediction window' },
  { value: '6',    label: 'signal categories' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [theme, toggleTheme, themeMounted] = useTheme()
  const { fact, loading, refresh } = useFunFact()

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard')
    } else {
      setCheckingAuth(false)
    }
  }, [router])

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1e3a] text-sm text-white/60">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#5b9fe8] border-t-transparent" />
          <span>Verifying session…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-dl-bg">
      {/* ── Left brand panel ── */}
      <div className="relative hidden w-[480px] shrink-0 flex-col gap-12 overflow-hidden bg-[#0f1e3a] p-12 lg:flex xl:w-[520px]">
        {/* Background decorations */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full blur-3xl"
          style={{ background: 'rgba(47,126,218,0.2)' }} />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full blur-3xl"
          style={{ background: 'rgba(47,126,218,0.12)' }} />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 opacity-10"
          style={{ background: 'linear-gradient(90deg, transparent, #2f7eda, transparent)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <SiteLogo
            className="text-[18px] font-bold tracking-tight text-white"
            iconClassName="rounded-lg bg-[#2f7eda]/20"
          />
          <p className="mt-3 text-sm leading-relaxed text-white/50">
            Predictive dependency intelligence for engineering teams.
          </p>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8 my-auto">
          {/* Stats row */}
          <div className="flex gap-6">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-[11px] text-white/40">{label}</p>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2f7eda]/15">
                  <Icon className="h-4 w-4 text-[#5b9fe8]" />
                </div>
                <span className="text-[13px] text-white/70">{text}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Fun fact */}
        <div className="relative z-10 mt-auto rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-3.5 w-3.5 text-[#f59e0b]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/40">Fun fact</span>
            </div>
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="flex h-5 w-5 items-center justify-center rounded text-white/30 transition-colors hover:text-white/60 disabled:opacity-40"
              aria-label="New fact"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {loading && !fact ? (
            <div className="space-y-1.5">
              <div className="h-2.5 w-full rounded-full bg-white/10 animate-pulse" />
              <div className="h-2.5 w-4/5 rounded-full bg-white/10 animate-pulse" />
              <div className="h-2.5 w-3/5 rounded-full bg-white/10 animate-pulse" />
            </div>
          ) : fact ? (
            <p className={`text-[12px] leading-relaxed text-white/60 transition-opacity duration-300 ${loading ? 'opacity-40' : 'opacity-100'}`}>
              {fact}
            </p>
          ) : (
            <p className="text-[12px] text-white/30">Could not load a fact right now.</p>
          )}
        </div>

      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col">
        {/* Header: mobile logo + theme toggle (desktop too) */}
        <header className="flex h-[60px] items-center justify-between border-b border-dl-border px-6">
          <SiteLogo className="text-[16px] font-bold text-dl-navy lg:hidden" />
          <span className="hidden lg:block" />
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-dl-border bg-dl-surface text-dl-muted transition-all hover:border-dl-blue hover:text-dl-blue"
            aria-label="Toggle dark mode"
          >
            {themeMounted && theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  )
}
