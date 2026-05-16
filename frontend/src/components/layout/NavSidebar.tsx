'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Bell, GitBranch, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Packages',  href: '/packages',  icon: Package },
  { label: 'Alerts',    href: '/alerts',    icon: Bell },
  { label: 'Repos',     href: '/repos',     icon: GitBranch },
]

export function NavSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-56 shrink-0 border-r border-dl-border bg-dl-surface h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-dl-border">
        <Activity className="w-5 h-5 text-dl-healthy" />
        <span className="font-bold text-dl-text tracking-tight text-sm">DriftLogg</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                active
                  ? 'bg-white/8 text-dl-text font-medium'
                  : 'text-dl-muted hover:text-dl-text hover:bg-white/4'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-dl-border">
        <p className="text-xs text-dl-muted">acme-corp</p>
      </div>
    </aside>
  )
}
