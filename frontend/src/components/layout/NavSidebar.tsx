'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard, Package, Bell, GitBranch, Settings2,
  CreditCard, User, LogOut, ChevronLeft, ChevronRight,
  BarChart2, Activity, HelpCircle, Zap, Shield,
} from 'lucide-react'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { useAppData } from '@/context/AppDataContext'
import { getUnreadCount } from '@/lib/alertsData'
import { cn } from '@/lib/utils'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard',  href: '/dashboard',    icon: LayoutDashboard },
      { label: 'Analytics',  href: '/analytics',    icon: BarChart2 },
      { label: 'Activity',   href: '/activity',     icon: Activity },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { label: 'Packages',     href: '/packages',     icon: Package },
      { label: 'Alerts',       href: '/alerts',       icon: Bell, showBadge: true },
      { label: 'Repos',        href: '/repos',        icon: GitBranch },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Integrations', href: '/integrations', icon: Zap },
      { label: 'Security',     href: '/security',     icon: Shield },
      { label: 'Billing',      href: '/billing',      icon: CreditCard },
      { label: 'Settings',     href: '/settings',     icon: Settings2 },
    ],
  },
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

  const initials = (user?.fullName
    ? user.fullName.split(/\s+/).map((p) => p[0]).join('').slice(0, 2)
    : (user?.email ?? 'U').slice(0, 2)
  ).toUpperCase()

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-30 flex h-screen flex-col border-r border-[#e4e8ee] bg-white transition-[width,transform] duration-300 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        isCollapsed ? 'w-[240px] md:w-[64px]' : 'w-[240px] md:w-[240px]'
      )}
    >
      {/* ── Logo row ── */}
      <div className={cn(
        'flex h-[60px] shrink-0 items-center justify-between border-b border-[#e4e8ee] px-5',
        isCollapsed ? 'md:justify-center md:px-3' : ''
      )}>
        <SiteLogo
          className={cn(
            'text-[16px] font-bold tracking-tight text-[#1e2a3c] transition-all duration-200',
            isCollapsed ? 'md:hidden' : ''
          )}
          iconClassName="rounded-lg bg-[#2f7eda]/10"
        />
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'flex items-center justify-center rounded-lg p-1.5 text-[#9fa0b5] hover:bg-[#f0f5ff] hover:text-[#2f7eda] transition-all duration-150 focus:outline-none',
              isCollapsed ? 'md:mt-0' : 'hidden md:flex'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed
              ? <ChevronRight className="h-4 w-4" />
              : <ChevronLeft className="h-4 w-4" />
            }
          </button>
        )}
      </div>

      {/* ── Nav sections ── */}
      <nav className={cn(
        'flex flex-1 flex-col gap-5 overflow-y-auto py-5 transition-all duration-200',
        isCollapsed ? 'px-2 md:px-2' : 'px-3'
      )}>
        {NAV_SECTIONS.map(({ label, items }) => (
          <div key={label} className="flex flex-col gap-0.5">
            {!isCollapsed && (
              <p className={cn(
                'mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9fa0b5] transition-all duration-200',
                isCollapsed ? 'md:hidden' : ''
              )}>
                {label}
              </p>
            )}
            {items.map(({ label: itemLabel, href, icon: Icon, showBadge }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              const isDisabled = href === '/analytics' || href === '/activity' || href === '/security' || href === '/settings'
              return (
                <Link
                  key={href}
                  href={isDisabled ? '/dashboard' : href}
                  onClick={onClose}
                  title={isCollapsed ? itemLabel : undefined}
                  className={cn(
                    'relative flex items-center gap-3 rounded-lg py-2 text-[13px] font-medium transition-all duration-150',
                    active
                      ? 'bg-[#eaf2fd] text-[#2f7eda]'
                      : 'text-[#9fa0b5] hover:bg-[#f5f7fa] hover:text-[#555663]',
                    isCollapsed ? 'md:justify-center md:px-0 md:py-2.5' : 'px-2.5',
                    isDisabled && !active ? 'opacity-50 cursor-not-allowed' : ''
                  )}
                >
                  {active && !isCollapsed && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-[#2f7eda]" />
                  )}
                  <div className="relative flex shrink-0 items-center justify-center">
                    <Icon className={cn(
                      'h-4 w-4 transition-colors',
                      active ? 'text-[#2f7eda]' : 'text-[#9fa0b5]'
                    )} />
                    {showBadge && alertCount > 0 && isCollapsed && (
                      <span className="absolute -top-1 -right-1 hidden h-2 w-2 rounded-full bg-red-500 md:block ring-2 ring-white" />
                    )}
                  </div>
                  <span className={cn(
                    'transition-all duration-200',
                    isCollapsed ? 'md:hidden' : ''
                  )}>
                    {itemLabel}
                  </span>
                  {showBadge && alertCount > 0 && (
                    <span className={cn(
                      'ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white transition-all duration-200',
                      isCollapsed ? 'md:hidden' : ''
                    )}>
                      {alertCount}
                    </span>
                  )}
                  {isDisabled && !isCollapsed && (
                    <span className="ml-auto rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide bg-[#edeff3] text-[#9fa0b5]">
                      Soon
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* ── Help link ── */}
      <div className={cn(
        'border-t border-[#e4e8ee] px-3 py-3',
        isCollapsed ? 'md:px-2' : ''
      )}>
        <a
          href="mailto:support@driftlogg.com"
          title={isCollapsed ? 'Help & Support' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-lg py-2 text-[13px] font-medium text-[#9fa0b5] hover:bg-[#f5f7fa] hover:text-[#555663] transition-all duration-150',
            isCollapsed ? 'md:justify-center md:px-0' : 'px-2.5'
          )}
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          <span className={cn('transition-all duration-200', isCollapsed ? 'md:hidden' : '')}>
            Help &amp; Support
          </span>
        </a>
      </div>

      {/* ── Profile ── */}
      <div className={cn(
        'border-t border-[#e4e8ee] p-3',
        isCollapsed ? 'md:px-2' : ''
      )}>
        <div ref={profileRef} className="relative w-full">
          {profileOpen && (
            <div className={cn(
              'absolute bottom-14 left-0 z-50 flex flex-col gap-0.5 rounded-xl border border-[#e4e8ee] bg-white p-2 shadow-xl',
              isCollapsed ? 'md:left-0 md:w-52' : 'right-0'
            )}>
              <div className="px-3 py-2 mb-1">
                <p className="text-[12px] font-semibold text-[#1e2a3c] truncate">
                  {user?.fullName ?? user?.nickname ?? 'User'}
                </p>
                <p className="text-[11px] text-[#9fa0b5] truncate">{user?.email}</p>
              </div>
              <div className="border-t border-[#e4e8ee] pt-1">
                <Link
                  href="/profile"
                  onClick={() => { setProfileOpen(false); onClose() }}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] font-medium text-[#555663] hover:bg-[#f5f7fa] hover:text-[#2f7eda] transition-colors duration-150"
                >
                  <User className="h-3.5 w-3.5" />
                  Profile settings
                </Link>
                <button
                  type="button"
                  onClick={() => { setProfileOpen(false); onClose(); signOut() }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] font-medium text-red-500 hover:bg-red-50 transition-colors duration-150"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setProfileOpen(p => !p)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl p-2 text-left transition-all duration-150 hover:bg-[#f5f7fa] focus:outline-none',
              isCollapsed ? 'md:justify-center' : ''
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2f7eda] to-[#1a5fb4] text-[11px] font-bold text-white shadow-sm">
              {initials}
            </div>
            <div className={cn('flex-1 min-w-0 transition-all duration-200', isCollapsed ? 'md:hidden' : '')}>
              <p className="truncate text-[12px] font-semibold text-[#1e2a3c]">
                {user?.nickname ?? user?.fullName ?? user?.email ?? '…'}
              </p>
              <p className="text-[10px] text-[#9fa0b5] truncate">{user?.email}</p>
            </div>
            <ChevronRight className={cn(
              'h-3.5 w-3.5 text-[#9fa0b5] transition-transform duration-150',
              profileOpen ? 'rotate-90' : '',
              isCollapsed ? 'md:hidden' : ''
            )} />
          </button>
        </div>
      </div>
    </aside>
  )
}
