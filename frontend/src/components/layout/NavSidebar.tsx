'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { LayoutDashboard, Package, Bell, GitBranch, Mail, Settings, User, LogOut } from 'lucide-react'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { alerts } from '@/lib/mockData'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Packages', href: '/packages', icon: Package },
  { label: 'Alerts', href: '/alerts', icon: Bell, showBadge: true },
  { label: 'Repos', href: '/repos', icon: GitBranch },
]

const alertCount = alerts.filter(a => !a.slackSent).length

interface NavSidebarProps {
  open: boolean
  onClose: () => void
}

export function NavSidebar({ open, onClose }: NavSidebarProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-30 flex h-screen w-[220px] flex-col border-r border-dl-m-border bg-dl-nav transition-transform duration-200',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
    >
      <div className="border-b border-dl-border px-5 py-5">
        <SiteLogo
          className="text-[17px] font-semibold text-dl-sage-light"
          iconClassName="rounded-md bg-dl-teal/20"
        />
      </div>

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

      <div ref={menuRef} className="relative border-t border-dl-border px-4 py-4">
        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute bottom-16 left-4 right-4 z-50 flex flex-col gap-1 rounded-lg border border-dl-m-border bg-dl-card p-1.5 shadow-lg">
            <Link
              href="/profile"
              onClick={() => {
                setMenuOpen(false)
                onClose()
              }}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs text-dl-muted hover:bg-dl-cream hover:text-dl-forest transition-colors duration-150"
            >
              <User className="h-3.5 w-3.5" />
              <span>Profile settings</span>
            </Link>
            <Link
              href="/login"
              onClick={() => {
                setMenuOpen(false)
                onClose()
              }}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs text-dl-critical hover:bg-dl-critical/10 transition-colors duration-150"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex w-full items-center gap-3 rounded-lg text-left transition-colors duration-150 hover:bg-dl-cream/5 focus:outline-none"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dl-teal/20 text-[12px] font-medium text-dl-teal">
            DL
          </div>
          <span className="truncate text-[11px] text-dl-hint">you@driftlogg.io</span>
        </button>
      </div>
    </aside>
  )
}
