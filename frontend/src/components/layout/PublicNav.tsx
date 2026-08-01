'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SiteLogo } from '@/components/layout/SiteLogo'

const LINKS = [
  { href: '/', label: 'Home', match: (path: string) => path === '/' },
  { href: '/pricing', label: 'Pricing', match: (path: string) => path.startsWith('/pricing') },
  { href: '/docs', label: 'Docs', match: (path: string) => path.startsWith('/docs') },
] as const

export function PublicNav() {
  const pathname = usePathname()

  return (
    <nav className="public-nav relative z-[5] flex w-full items-center gap-5 border-b border-black/[0.09] py-[26px] md:gap-9">
      <SiteLogo
        className="public-nav-brand mr-auto"
        size={40}
        wordmarkClassName="text-[22px] font-semibold tracking-[-0.02em] text-[#08090a]"
      />

      <div className="hidden items-center gap-9 md:flex">
        {LINKS.map(({ href, label, match }) => {
          const active = match(pathname)
          return (
            <Link
              key={href}
              href={href}
              className={`text-[14.5px] transition-colors ${
                active ? 'public-nav-link-active' : 'public-nav-link'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>

      <Link
        href="/register"
        className="public-nav-cta rounded-full bg-[#08090a] px-4 py-[9px] text-[14px] font-medium text-[#f2f0ed] transition-opacity hover:opacity-80"
      >
        Install Beacon
      </Link>
    </nav>
  )
}
