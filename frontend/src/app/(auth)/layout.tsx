'use client'

import { Shield, TrendingDown, Bell, Zap, CheckCircle2, Package } from 'lucide-react'
import { SiteLogo } from '@/components/layout/SiteLogo'

const FEATURES = [
  { icon: TrendingDown, text: 'Predict package death up to 60 days early' },
  { icon: Shield,       text: 'CVE & supply chain alerts in real-time' },
  { icon: Bell,         text: 'Slack & Google Chat notifications' },
  { icon: Zap,          text: 'XGBoost-powered SPS scoring engine' },
]

const TESTIMONIALS = [
  { quote: 'Found 3 critical packages before our release. Saved us a production incident.', name: 'Priya S.', role: 'Lead Engineer' },
  { quote: 'The SPS trend chart is exactly what our quarterly security review needed.', name: 'Marcus L.', role: 'CTO' },
]

const STATS = [
  { value: '500+', label: 'packages monitored' },
  { value: '60d',  label: 'prediction window' },
  { value: '6',    label: 'signal categories' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* ── Left brand panel ── */}
      <div className="relative hidden w-[480px] shrink-0 flex-col justify-between overflow-hidden bg-[#0f1e3a] p-12 lg:flex xl:w-[520px]">
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
        <div className="relative z-10 space-y-8">
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

          {/* Mini chart decoration */}
          <div className="rounded-xl border border-white/8 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-[#5b9fe8]" />
                <span className="text-[11px] font-medium text-white/60">Stack SPS trend</span>
              </div>
              <span className="text-[11px] font-bold text-[#22c55e]">↑ +12.4</span>
            </div>
            <div className="flex items-end gap-1 h-10">
              {[40,55,45,60,52,70,65,80,75,88,82,95].map((h, i) => (
                <div key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${h}%`,
                    background: i >= 9 ? '#2f7eda' : 'rgba(47,126,218,0.25)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 space-y-4">
          {TESTIMONIALS.map(({ quote, name, role }) => (
            <div key={name} className="rounded-xl border border-white/8 bg-white/5 p-4">
              <div className="mb-2 flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <CheckCircle2 key={i} className="h-3 w-3 text-[#2f7eda]" />
                ))}
              </div>
              <p className="text-[12px] leading-relaxed text-white/60">&ldquo;{quote}&rdquo;</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2f7eda]/30 text-[10px] font-bold text-white">
                  {name[0]}
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white/80">{name}</p>
                  <p className="text-[10px] text-white/40">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex h-[60px] items-center border-b border-[#e4e8ee] px-6 lg:hidden">
          <SiteLogo className="text-[16px] font-bold text-[#1e2a3c]" />
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  )
}
