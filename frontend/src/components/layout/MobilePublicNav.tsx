'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { SiteLogo } from '@/components/layout/SiteLogo'

type NavLink = {
  href: string
  label: string
  active?: boolean
}

type MobilePublicNavProps = {
  links: NavLink[]
  ctaHref?: string
  ctaLabel?: string
}

export function MobilePublicNav({
  links,
  ctaHref = '/get-started',
  ctaLabel = 'Install Beacon',
}: MobilePublicNavProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.12] text-[#08090a] transition-colors hover:bg-black/[0.04] md:hidden"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" strokeWidth={2} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 top-0 border-b border-black/[0.09] bg-white px-5 pb-6 pt-5 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <SiteLogo
                className="mr-auto"
                size={36}
                wordmarkClassName="text-[20px] font-semibold tracking-[-0.02em] text-[#08090a]"
                onClick={() => setOpen(false)}
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.12] text-[#08090a]"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-3.5 py-3 text-[16px] transition-colors ${
                    link.active
                      ? 'bg-black/[0.05] font-semibold text-[#08090a]'
                      : 'font-medium text-[rgba(8,9,10,.7)] hover:bg-black/[0.03] hover:text-[#08090a]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <Link
              href={ctaHref}
              onClick={() => setOpen(false)}
              className="bl-btn-primary mt-5 flex w-full items-center justify-center !rounded-full px-4 py-3.5 text-[15px] font-medium"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
