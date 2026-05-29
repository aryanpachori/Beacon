'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Bell, GitBranch } from 'lucide-react'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Packages', href: '/packages', icon: Package },
  { label: 'Alerts', href: '/alerts', icon: Bell },
  { label: 'Repos', href: '/repos', icon: GitBranch },
]

export function NavSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-dl-m-border bg-dl-card">
      <div className="border-b border-dl-m-border px-5 py-5">
        <SiteLogo className="text-dl-forest" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-dl-teal/10 font-medium text-dl-forest'
                  : 'text-dl-m-muted hover:bg-dl-cream/80 hover:text-dl-forest'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
