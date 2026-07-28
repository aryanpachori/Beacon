'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

const NAV_LINKS = [
  { href: '/#features', label: 'Product' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/#compare', label: 'Compare' },
]

export function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [theme, toggleTheme, themeMounted] = useTheme()

  const isActive = (href: string) => href === '/pricing' && pathname === '/pricing'

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 h-[68px] border-b border-dl-border bg-dl-bg/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-full max-w-[1180px] items-center justify-between px-6">
        <SiteLogo
          className="text-dl-text"
          onClick={() => setOpen(false)}
        />

        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                'text-[13.5px] transition-colors',
                isActive(link.href)
                  ? 'text-dl-text'
                  : 'text-dl-muted hover:text-dl-text'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-dl-border bg-dl-surface text-dl-muted transition-all hover:border-dl-blue hover:text-dl-blue"
            aria-label="Toggle dark mode"
          >
            {themeMounted && theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
          <Link
            href="/login"
            className="text-[13.5px] text-dl-muted transition-colors hover:text-dl-text"
          >
            Sign in
          </Link>
          <Link href="/register" className="btn-primary px-5 py-2.5 text-[13px]">
            Install Beacon
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-dl-border bg-dl-surface text-dl-muted transition-all hover:border-dl-blue hover:text-dl-blue"
            aria-label="Toggle dark mode"
          >
            {themeMounted && theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? (
              <X className="h-5 w-5 text-dl-text" />
            ) : (
              <Menu className="h-5 w-5 text-dl-text" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-dl-border bg-dl-bg md:hidden"
          >
            <nav className="flex flex-col px-6 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="min-h-[44px] py-3 text-sm text-dl-muted transition-colors hover:text-dl-text"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="min-h-[44px] border-t border-dl-border py-3 text-sm text-dl-muted"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="btn-primary mt-2 justify-center"
                onClick={() => setOpen(false)}
              >
                Install Beacon
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
