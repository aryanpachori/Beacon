'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/#features', label: 'Product' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '#', label: 'Docs' },
]

export function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) => href === '/pricing' && pathname === '/pricing'

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 h-[60px] bg-dl-nav"
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6">
        <Link
          href="/"
          className="text-[17px] font-semibold text-dl-sage-light"
          onClick={() => setOpen(false)}
        >
          DriftLogg
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                'text-sm transition-colors',
                isActive(link.href)
                  ? 'text-dl-cream'
                  : 'text-dl-sage-light/55 hover:text-dl-cream'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/login"
            className="text-sm text-dl-sage-light/55 transition-colors hover:text-dl-cream"
          >
            Sign in
          </Link>
          <Link href="/register" className="btn-primary px-5 py-2.5 text-sm">
            Start free
          </Link>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? (
            <X className="h-5 w-5 text-dl-sage-light" />
          ) : (
            <Menu className="h-5 w-5 text-dl-sage-light" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-dl-sage-light/10 bg-dl-nav md:hidden"
          >
            <nav className="flex flex-col px-6 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="min-h-[44px] py-3 text-sm text-dl-sage-light/55 transition-colors hover:text-dl-cream"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="min-h-[44px] py-3 text-sm text-dl-sage-light/55"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="btn-primary mt-2 justify-center"
                onClick={() => setOpen(false)}
              >
                Start free
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
