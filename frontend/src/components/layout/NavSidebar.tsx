'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { LayoutDashboard, Package, Bell, GitBranch } from 'lucide-react'
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
    <aside className="flex flex-col w-56 shrink-0 border-r border-dash-border bg-dash-surface h-screen sticky top-0">
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 border-b border-dash-border px-5 py-5"
      >
        <Image
          src="/logo.png"
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 shrink-0 rounded-md"
        />
        <span className="text-sm font-bold tracking-tight text-dash-text">DriftLogg</span>
      </Link>

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
                  ? 'bg-white/8 text-dash-text font-medium'
                  : 'text-dash-muted hover:text-dash-text hover:bg-white/4'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-dash-border">
        <p className="text-xs text-dash-muted">acme-corp</p>
      </div>
    </aside>
  )
}
