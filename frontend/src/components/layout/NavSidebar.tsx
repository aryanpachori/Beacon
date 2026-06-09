'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard, Package, Bell, GitBranch, Mail, Settings,
  User, LogOut, X, ArrowRight,
} from 'lucide-react'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { alerts } from '@/lib/mockData'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/dashboard',      icon: LayoutDashboard },
  { label: 'Packages',     href: '/packages',        icon: Package },
  { label: 'Alerts',       href: '/alerts',          icon: Bell,    showBadge: true },
  { label: 'Repos',        href: '/repos',           icon: GitBranch },
  { label: 'Emails',       href: '/email-previews',  icon: Mail },
  { label: 'Integrations', href: '/integrations',    icon: Settings },
]

const unreadAlerts = alerts.filter(a => !a.slackSent)
const alertCount   = unreadAlerts.length

// ── Tier config ──────────────────────────────────────────────
const TIER: Record<string, {
  label: string; headerBg: string; headerBorder: string;
  badge: string; spsColor: string; accentBar: string;
}> = {
  critical: {
    label:        'Critical Health Drop',
    headerBg:     'rgba(192,48,48,0.18)',
    headerBorder: 'rgba(192,48,48,0.35)',
    badge:        'bg-[#C03030] text-white',
    spsColor:     '#e07070',
    accentBar:    '#C03030',
  },
  'at-risk': {
    label:        'At-Risk Package Alert',
    headerBg:     'rgba(196,120,32,0.18)',
    headerBorder: 'rgba(196,120,32,0.35)',
    badge:        'bg-[#C47820] text-white',
    spsColor:     '#d4963a',
    accentBar:    '#C47820',
  },
  watch: {
    label:        'Watch-Tier Notification',
    headerBg:     'rgba(74,122,48,0.18)',
    headerBorder: 'rgba(74,122,48,0.30)',
    badge:        'bg-[#4A7A30] text-white',
    spsColor:     '#8ab870',
    accentBar:    '#4A7A30',
  },
  healthy: {
    label:        'Health Update',
    headerBg:     'rgba(53,133,142,0.18)',
    headerBorder: 'rgba(53,133,142,0.30)',
    badge:        'bg-[#35858E] text-white',
    spsColor:     '#5bbec8',
    accentBar:    '#35858E',
  },
}

// Simple, human-readable messages per package
const PLAIN_MESSAGES: Record<string, { headline: string; body: string }> = {
  moment:      { headline: 'Your moment package is about to expire.',        body: "It hasn't been updated in a long time and the people behind it have gone quiet. You might want to switch before it causes problems." },
  request:     { headline: 'Your request package is no longer maintained.',   body: "The author has officially stopped working on it. It's a good time to move to something newer before it starts breaking things." },
  rxjs:        { headline: 'Your rxjs package needs attention soon.',          body: "The version you're using is getting old and updates are slowing down. Worth checking if there's a newer version to move to." },
  'node-sass': { headline: 'Your node-sass package may stop working.',        body: "It has trouble with newer versions of Node. Switching to the regular sass package should fix things quickly." },
  bower:       { headline: 'Your bower package is outdated and unsupported.',  body: "No one is updating it anymore, including for security fixes. It's safe to remove it and use npm instead." },
  gulp:        { headline: 'Your gulp package is falling behind.',             body: "The team maintaining it has slowed down and parts of it are breaking with modern tools. Consider switching to something like Vite." },
  'left-pad':  { headline: 'Your left-pad package is basically abandoned.',   body: "It does very little and nobody's working on it. You can replace it with a single line of built-in JavaScript." },
  passport:    { headline: 'Your passport package is getting stale.',          body: "Bug fixes and updates have been slow to arrive. It still works, but keep an eye on it — newer auth tools are catching up." },
}

function getMessage(packageId: string, tier: string) {
  return PLAIN_MESSAGES[packageId] ?? {
    headline: `Your ${packageId} package needs attention.`,
    body: `Something changed with this package and it\'s not looking healthy. Take a look before it causes any issues.`,
  }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86_400_000)
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor(diff / 60_000)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  return `${m}m ago`
}


interface NavSidebarProps {
  open: boolean
  onClose: () => void
}

export function NavSidebar({ open, onClose }: NavSidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()

  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen,   setNotifOpen]   = useState(false)

  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function toggleProfile() { setProfileOpen(p => !p); setNotifOpen(false) }
  function toggleNotif()   { setNotifOpen(n => !n);   setProfileOpen(false) }

  function handleAlertClick(packageId: string) {
    setNotifOpen(false)
    onClose()
    router.push(`/packages/${packageId}`)
  }

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-30 flex h-screen w-[220px] flex-col border-r border-dl-m-border bg-dl-nav transition-transform duration-200',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
    >
      {/* Logo */}
      <div className="border-b border-dl-border px-5 py-5">
        <SiteLogo
          className="text-[17px] font-semibold text-dl-sage-light"
          iconClassName="rounded-md bg-dl-teal/20"
        />
      </div>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ label, href, icon: Icon, showBadge }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                active
                  ? 'flex items-center gap-3 rounded-lg border-l-[3px] border-dl-teal bg-dl-teal/15 py-2.5 pl-[9px] pr-3 text-[13px] font-medium text-dl-forest'
                  : 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-dl-muted transition-colors duration-150 hover:bg-dl-cream hover:text-dl-forest'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-dl-teal' : 'text-dl-muted')} />
              {label}
              {showBadge && alertCount > 0 && (
                <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-dl-danger text-[10px] font-medium text-white">
                  {alertCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Bottom bar ── */}
      <div className="border-t border-dl-border px-4 py-4 flex items-center gap-2">

        {/* ── Notification button + flyout ── */}
        <div ref={notifRef} className="relative">

          {notifOpen && (
            /* ── Flyout panel ── */
            <div
              className="absolute bottom-12 left-0 z-50 flex flex-col overflow-hidden rounded-xl shadow-2xl"
              style={{
                width: '300px',
                background: '#080f0e',
                border: '1px solid rgba(53,133,142,0.18)',
              }}
            >
              {/* ── Panel header ── */}
              <div
                className="flex items-center justify-between px-3 py-2"
                style={{ background: '#0d1a18', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-1.5">
                  <Bell className="h-3 w-3 text-[#35858E]" />
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#C2D099', textTransform: 'uppercase' }}>
                    Notifications
                  </span>
                  {alertCount > 0 && (
                    <span style={{
                      background: 'rgba(192,48,48,0.2)',
                      border: '1px solid rgba(192,48,48,0.35)',
                      color: '#e07070',
                      fontSize: '9px',
                      fontWeight: 600,
                      padding: '0px 6px',
                      borderRadius: '99px',
                    }}>
                      {alertCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="rounded p-0.5 transition-colors hover:bg-white/5"
                  style={{ color: '#4a7a72' }}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              {/* ── Notification list ── */}
              <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
                {alerts.map((alert, idx) => {
                  const tier     = TIER[alert.tier] ?? TIER.watch
                  const isUnread = !alert.slackSent

                  return (
                    <button
                      key={alert.id}
                      type="button"
                      onClick={() => handleAlertClick(alert.packageId)}
                      className="w-full text-left group hover:bg-white/[0.03] transition-colors duration-150"
                      style={{
                        borderBottom: idx !== alerts.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        borderLeft: `2px solid ${tier.accentBar}`,
                        padding: '10px 12px',
                      }}
                    >
                      {/* Headline + timestamp */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isUnread && (
                            <span className="mt-[3px] h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#35858E' }} />
                          )}
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#d4ede8', lineHeight: '1.4' }}>
                            {getMessage(alert.packageId, alert.tier).headline}
                          </span>
                        </div>
                        <span style={{ fontSize: '9px', color: '#3d6b63', whiteSpace: 'nowrap', marginTop: '2px', flexShrink: 0 }}>
                          {timeAgo(alert.firedAt)}
                        </span>
                      </div>

                      {/* Meta: tier badge + CTA */}
                      <div className="flex items-center justify-between mt-1.5">
                        <span
                          className="rounded-full px-1.5 py-[1px] text-[9px] font-semibold uppercase"
                          style={{ background: tier.accentBar + '30', color: tier.spsColor, letterSpacing: '0.06em' }}
                        >
                          {alert.tier === 'at-risk' ? 'at-risk' : alert.tier}
                        </span>
                        <span
                          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ fontSize: '10px', fontWeight: 600, color: '#35858E' }}
                        >
                          Take a look <ArrowRight className="h-2.5 w-2.5" />
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* ── Panel footer ── */}
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ background: '#0d1a18', borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span style={{ fontSize: '10px', color: '#3d6b63' }}>
                  alerts@driftlogg.io
                </span>
                <Link
                  href="/alerts"
                  onClick={() => { setNotifOpen(false); onClose() }}
                  style={{ fontSize: '11px', fontWeight: 600, color: '#35858E' }}
                  className="hover:text-[#C2D099] transition-colors flex items-center gap-1"
                >
                  View all alerts <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Bell icon button */}
          <button
            type="button"
            onClick={toggleNotif}
            aria-label="Open notifications"
            className={cn(
              'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150',
              notifOpen ? 'bg-dl-teal/20 text-dl-teal' : 'text-dl-muted hover:bg-white/5 hover:text-white'
            )}
          >
            <Bell className="h-4 w-4" />
            {alertCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-dl-danger text-[8px] font-bold text-white leading-none">
                {alertCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Profile button ── */}
        <div ref={profileRef} className="relative flex-1">
          {profileOpen && (
            <div className="absolute bottom-12 left-0 right-0 z-50 flex flex-col gap-1 rounded-lg border border-dl-m-border bg-dl-card p-1.5 shadow-lg">
              <Link
                href="/profile"
                onClick={() => { setProfileOpen(false); onClose() }}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs text-dl-muted hover:bg-dl-cream hover:text-dl-forest transition-colors duration-150"
              >
                <User className="h-3.5 w-3.5" />
                <span>Profile settings</span>
              </Link>
              <Link
                href="/login"
                onClick={() => { setProfileOpen(false); onClose() }}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs text-dl-critical hover:bg-dl-critical/10 transition-colors duration-150"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={toggleProfile}
            className="flex w-full items-center gap-2 rounded-lg text-left transition-colors duration-150 hover:bg-dl-cream/5 focus:outline-none"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dl-teal/20 text-[12px] font-medium text-dl-teal">
              DL
            </div>
            <span className="truncate text-[11px] text-dl-hint">you@driftlogg.io</span>
          </button>
        </div>

      </div>
    </aside>
  )
}
