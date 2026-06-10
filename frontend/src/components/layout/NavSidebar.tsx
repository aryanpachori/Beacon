'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard, Package, Bell, GitBranch, Settings,
  CreditCard, User, LogOut,
} from 'lucide-react'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { useAppData } from '@/context/AppDataContext'
import { getUnreadCount } from '@/lib/alertsData'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/dashboard',      icon: LayoutDashboard },
  { label: 'Packages',     href: '/packages',        icon: Package },
  { label: 'Alerts',       href: '/alerts',          icon: Bell,    showBadge: true },
  { label: 'Repos',        href: '/repos',           icon: GitBranch },
  { label: 'Integrations', href: '/integrations',    icon: Settings },
  { label: 'Billing',      href: '/billing',         icon: CreditCard },
]


interface NavSidebarProps {
  open: boolean
  onClose: () => void
}

export function NavSidebar({ open, onClose }: NavSidebarProps) {
  const pathname = usePathname()
  const { user, alerts, signOut } = useAppData()
  const alertCount = getUnreadCount(alerts)

  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function toggleProfile() { setProfileOpen(p => !p) }

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
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  onClose()
                  signOut()
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs text-dl-critical hover:bg-dl-critical/10 transition-colors duration-150"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={toggleProfile}
            className="flex w-full items-center gap-2 rounded-lg text-left transition-colors duration-150 hover:bg-dl-cream/5 focus:outline-none"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dl-teal/20 text-[12px] font-medium text-dl-teal">
              {(user?.fullName
                ? user.fullName.split(/\s+/).map((p) => p[0]).join('').slice(0, 2)
                : (user?.email ?? 'U').slice(0, 2)
              ).toUpperCase()}
            </div>
            <span className="truncate text-[11px] text-dl-hint">
              {user?.nickname ?? user?.fullName ?? user?.email ?? '…'}
            </span>
          </button>
        </div>

      </div>
    </aside>
  )
}

