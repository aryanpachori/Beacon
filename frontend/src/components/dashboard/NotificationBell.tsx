'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Bell, X, ArrowRight } from 'lucide-react'
import { useAppData } from '@/context/AppDataContext'
import { cn } from '@/lib/utils'

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

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86_400_000)
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor(diff / 60_000)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  return `${m}m ago`
}

export function NotificationBell() {
  const router = useRouter()
  const { alerts } = useAppData()
  const recentAlerts = alerts.slice(0, 8)
  const unreadAlerts = alerts.filter(a => !a.slackSent)
  const alertCount = unreadAlerts.length

  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function toggleNotif() { setNotifOpen(n => !n) }

  function handleAlertClick(packageId: string) {
    setNotifOpen(false)
    router.push(`/packages/${packageId}`)
  }

  return (
    <div ref={notifRef} className="relative">

      {notifOpen && (
        <div
          className="absolute top-12 right-0 z-50 flex flex-col overflow-hidden rounded-xl shadow-2xl"
          style={{
            width: '340px',
            background: '#080f0e',
            border: '1px solid rgba(53,133,142,0.18)',
          }}
        >
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

          <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
            {recentAlerts.length === 0 ? (
              <p className="px-4 py-6 text-center text-[12px] text-dl-muted">
                No alerts yet
              </p>
            ) : (
              recentAlerts.map((alert, idx) => {
                const tier = TIER[alert.tier] ?? TIER.watch
                const isUnread = !alert.slackSent
                const headline =
                  alert.aiReason?.split('.')[0] ??
                  `${alert.packageName} health changed (${alert.spsBefore} → ${alert.spsAfter})`

                return (
                  <button
                    key={alert.id}
                    type="button"
                    onClick={() => handleAlertClick(alert.packageId)}
                    className="w-full text-left group hover:bg-white/[0.03] transition-colors duration-150"
                    style={{
                      borderBottom: idx !== recentAlerts.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      borderLeft: `2px solid ${tier.accentBar}`,
                      padding: '10px 12px',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isUnread && (
                          <span className="mt-[3px] h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#35858E' }} />
                        )}
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#d4ede8', lineHeight: '1.4' }}>
                          {headline}
                        </span>
                      </div>
                      <span style={{ fontSize: '9px', color: '#3d6b63', whiteSpace: 'nowrap', marginTop: '2px', flexShrink: 0 }}>
                        {timeAgo(alert.firedAt)}
                      </span>
                    </div>

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
              })
            )}
          </div>

          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ background: '#0d1a18', borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span style={{ fontSize: '10px', color: '#3d6b63' }}>
              alerts@driftlogg.io
            </span>
            <Link
              href="/alerts"
              onClick={() => setNotifOpen(false)}
              style={{ fontSize: '11px', fontWeight: 600, color: '#35858E' }}
              className="hover:text-[#C2D099] transition-colors flex items-center gap-1"
            >
              View all alerts <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleNotif}
        aria-label="Open notifications"
        className={cn(
          'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-150',
          notifOpen ? 'bg-dl-teal/20 text-dl-teal' : 'text-dl-muted hover:bg-dl-cream hover:text-dl-forest'
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
  )
}
