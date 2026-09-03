'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { MobilePublicNav } from '@/components/layout/MobilePublicNav'

const LINKS = [
  { href: '/', label: 'Home', match: (path: string) => path === '/' },
  { href: '/pricing', label: 'Pricing', match: (path: string) => path.startsWith('/pricing') },
  { href: '/docs', label: 'Docs', match: (path: string) => path.startsWith('/docs') },
] as const

export function PublicNav() {
  const pathname = usePathname()

  return (
    <nav className="public-nav relative z-[5] flex w-full items-center gap-3 border-b border-black/[0.09] py-5 sm:gap-5 sm:py-[26px] md:gap-9">
      <SiteLogo
        className="public-nav-brand mr-auto"
        size={36}
        wordmarkClassName="text-[20px] font-semibold tracking-[-0.02em] text-[#08090a] sm:text-[22px]"
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
        href="/get-started"
        className="public-nav-cta bl-btn-primary !rounded-full !px-3.5 !py-2 text-[13px] sm:!px-4 sm:!py-[9px] sm:text-[14px]"
      >
        Install Beacon
      </Link>

      <MobilePublicNav
        links={LINKS.map(({ href, label, match }) => ({
          href,
          label,
          active: match(pathname),
        }))}
      />
    </nav>
  )
}
