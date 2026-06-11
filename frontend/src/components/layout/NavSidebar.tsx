'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard, Package, Bell, GitBranch, Settings,
  CreditCard, User, LogOut, ChevronLeft, ChevronRight,
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
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function NavSidebar({
  open,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: NavSidebarProps) {
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
        'fixed top-0 left-0 z-30 flex h-screen w-[220px] flex-col border-r border-dl-m-border bg-dl-nav transition-[width,transform] duration-200',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        isCollapsed ? 'w-[220px] md:w-[64px]' : 'w-[220px] md:w-[220px]'
      )}
    >
      {/* Logo */}
      <div className={cn("border-b border-dl-border px-5 py-5 flex items-center transition-all duration-200", isCollapsed ? "md:px-4 md:justify-center" : "")}>
        <SiteLogo
          className={cn("text-[17px] font-semibold text-dl-sage-light transition-all duration-200", isCollapsed ? "md:hidden" : "")}
          iconClassName="rounded-md bg-dl-teal/20"
        />
      </div>

      {/* Nav links */}
      <nav className={cn("flex flex-1 flex-col gap-1 overflow-y-auto py-4 transition-all duration-200", isCollapsed ? "px-3 md:px-2" : "px-3")}>
        {NAV_ITEMS.map(({ label, href, icon: Icon, showBadge }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg py-2.5 text-[13px] transition-all duration-150',
                active
                  ? 'border-l-[3px] border-dl-teal bg-dl-teal/15 font-medium text-dl-forest pl-[9px] pr-3'
                  : 'text-dl-muted hover:bg-dl-cream hover:text-dl-forest px-3',
                isCollapsed ? 'md:justify-center md:px-0 md:pl-0 md:pr-0' : ''
              )}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-dl-teal' : 'text-dl-muted')} />
                {showBadge && alertCount > 0 && isCollapsed && (
                  <span className="absolute -top-1 -right-1 hidden h-2 w-2 rounded-full bg-dl-danger md:block" />
                )}
              </div>
              <span className={cn("transition-opacity duration-200", isCollapsed ? 'md:hidden' : '')}>{label}</span>
              {showBadge && alertCount > 0 && (
                <span className={cn("ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-dl-danger text-[10px] font-medium text-white transition-all duration-200", isCollapsed ? 'md:hidden' : '')}>
                  {alertCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Bottom bar ── */}
      <div className={cn("border-t border-dl-border py-4 flex flex-col gap-3 transition-all duration-200", isCollapsed ? "px-4 md:px-2" : "px-4")}>

        {/* ── Profile button ── */}
        <div ref={profileRef} className="relative w-full">
          {profileOpen && (
            <div className={cn(
              "absolute bottom-12 left-0 right-0 z-50 flex flex-col gap-1 rounded-lg border border-dl-m-border bg-dl-card p-1.5 shadow-lg",
              isCollapsed ? "md:right-auto md:left-0 md:w-48" : ""
            )}>
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
            className={cn(
              "flex w-full items-center gap-2 rounded-lg text-left transition-colors duration-150 hover:bg-dl-cream/5 focus:outline-none",
              isCollapsed ? "md:justify-center md:px-0" : ""
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dl-teal/20 text-[12px] font-medium text-dl-teal">
              {(user?.fullName
                ? user.fullName.split(/\s+/).map((p) => p[0]).join('').slice(0, 2)
                : (user?.email ?? 'U').slice(0, 2)
              ).toUpperCase()}
            </div>
            <span className={cn("truncate text-[11px] text-dl-hint transition-all duration-200", isCollapsed ? "md:hidden" : "")}>
              {user?.nickname ?? user?.fullName ?? user?.email ?? '…'}
            </span>
          </button>
        </div>

        {/* Toggle Collapse button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              "hidden md:flex items-center gap-3 rounded-lg py-2 text-[13px] text-dl-muted hover:bg-dl-cream hover:text-dl-forest transition-colors duration-150",
              isCollapsed ? "px-0 justify-center" : "px-3"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span>Collapse sidebar</span>
              </>
            )}
          </button>
        )}

      </div>
    </aside>
  )
}

