'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/', label: 'Home', match: (path: string) => path === '/' },
  { href: '/docs', label: 'Docs', match: (path: string) => path.startsWith('/docs') },
  { href: '/pricing', label: 'Pricing', match: (path: string) => path.startsWith('/pricing') },
] as const

export function PublicNav() {
  const pathname = usePathname()

  return (
    <nav className="public-nav relative z-[5] flex w-full items-center gap-5 border-b-2 border-white/[0.09] py-[26px] md:gap-9">
      <Link href="/" className="public-nav-brand mr-auto flex items-center gap-[11px]">
        <Image
          src="/beacon-mark.png"
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 shrink-0 object-contain"
          priority
        />
        <span className="text-[19px] font-semibold tracking-[-0.02em] text-[#f2f0ed]">beacon</span>
      </Link>

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
        className="public-nav-cta rounded-full bg-[#ff6600] px-4 py-[9px] text-[14px] font-medium transition-colors hover:bg-[#ff8533]"
      >
        Install Beacon
      </Link>
    </nav>
  )
}
