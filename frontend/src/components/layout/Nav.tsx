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
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 h-[60px] bg-dl-nav"
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6">
        <SiteLogo
          className="text-white"
          onClick={() => setOpen(false)}
        />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                'text-sm transition-colors',
                isActive(link.href)
                  ? 'text-white'
                  : 'text-white/70 hover:text-white'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {themeMounted && theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
          <Link
            href="/login"
            className="text-sm text-white/70 transition-colors hover:text-white"
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
            <X className="h-5 w-5 text-white" />
          ) : (
            <Menu className="h-5 w-5 text-white" />
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
            className="overflow-hidden border-t border-white/10 bg-dl-nav md:hidden"
          >
            <nav className="flex flex-col px-6 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="min-h-[44px] py-3 text-sm text-white/70 transition-colors hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center justify-between min-h-[44px] py-3 text-sm text-white/70 border-b border-white/10">
                <span>Theme</span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:text-white"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {themeMounted && theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
                </button>
              </div>
              <Link
                href="/login"
                className="min-h-[44px] py-3 text-sm text-white/70"
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
