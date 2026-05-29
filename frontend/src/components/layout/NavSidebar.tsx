'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Bell, GitBranch } from 'lucide-react'
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

      <div className="flex items-center gap-3 border-t border-dl-border px-4 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dl-teal/20 text-[12px] font-medium text-dl-teal">
          DL
        </div>
        <span className="truncate text-[11px] text-dl-hint">you@driftlogg.io</span>
      </div>
    </aside>
  )
}
