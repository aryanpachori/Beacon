'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/#features', label: 'Product' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/#compare', label: 'Compare' },
]

export function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const currentTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setTheme(currentTheme)
    document.documentElement.setAttribute('data-theme', currentTheme === 'dark' ? 'app' : 'light')
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme === 'dark' ? 'app' : 'light')
  }

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
          className="text-dl-sage-light"
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
                  ? 'text-dl-cream'
                  : 'text-dl-sage-light/55 hover:text-dl-cream'
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
            className="flex h-9 w-9 items-center justify-center rounded-lg text-dl-sage-light/55 transition-colors hover:bg-white/5 hover:text-dl-cream"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
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
              <div className="flex items-center justify-between min-h-[44px] py-3 text-sm text-dl-sage-light/55 border-b border-dl-sage-light/10">
                <span>Theme</span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-dl-sage-light/55 transition-colors hover:text-dl-cream"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
                </button>
              </div>
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
