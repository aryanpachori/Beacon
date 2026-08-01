'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard, Package,
  CreditCard, User, LogOut, ChevronLeft, ChevronRight,
  HelpCircle,
  Command, Sun, Moon, MessageSquarePlus, Radar,
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { FeedbackModal } from '@/components/layout/FeedbackModal'
import { useAppData } from '@/context/AppDataContext'
import { avatarUrl } from '@/lib/gravatar'
import { cn } from '@/lib/utils'

/* ── Plan label/color ────────────────────────────────────────────────── */
function planChip(plan: string) {
  if (plan === 'pro')  return { label: 'Pro',  bg: 'rgba(79,97,40,0.15)', text: 'var(--dl-blue)' }
  if (plan === 'team') return { label: 'Team', bg: 'rgba(22,163,74,0.15)', text: 'var(--dl-healthy)' }
  return                      { label: 'Free', bg: 'var(--dl-surface)', text: 'var(--dl-muted)' }
}

const NAV_ITEMS = [
  { label: 'Overview',            href: '/dashboard',          icon: LayoutDashboard },
  { label: 'Agent Activity',      href: '/agent-activity',     icon: Radar },
  { label: 'Dependency Tracker',  href: '/dependency-tracker', icon: Package },
  { label: 'Billing',             href: '/billing',             icon: CreditCard },
]

interface NavSidebarProps {
  open: boolean
  onClose: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function NavSidebar({
  open,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: NavSidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAppData()

  const [theme, toggleTheme, themeMounted] = useTheme()
  const [profileOpen, setProfileOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const plan = user?.plan ?? 'free'
  const chip = planChip(plan)

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-30 flex h-screen flex-col border-r border-dl-border bg-dl-bg transition-[width,transform] duration-300 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        isCollapsed ? 'w-[216px] md:w-[56px]' : 'w-[216px] md:w-[216px]'
      )}
    >
      {/* ── Logo row ── */}
      <div className={cn(
        'flex h-[48px] shrink-0 items-center justify-between border-b border-dl-border px-3.5',
        isCollapsed ? 'md:justify-center md:px-3' : ''
      )}>
        <SiteLogo
          className={cn(
            'text-[13.5px] font-semibold tracking-tight text-dl-navy transition-all duration-200',
            isCollapsed ? 'md:hidden' : ''
          )}
          iconClassName="rounded-md bg-[#ff894c]/10"
        />
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'flex items-center justify-center rounded-lg p-1.5 text-dl-muted hover:bg-dl-surface hover:text-dl-blue transition-all duration-150 focus:outline-none',
              isCollapsed ? 'md:mt-0' : 'hidden md:flex'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed
              ? <ChevronRight className="h-4 w-4" />
              : <ChevronLeft className="h-4 w-4" />
            }
          </button>
        )}
      </div>

      {/* ── Nav items (flat, no sections) ── */}
      <nav className={cn(
        'flex flex-1 flex-col overflow-y-auto py-3 transition-all duration-200',
        isCollapsed ? 'px-2 md:px-2 gap-1' : 'px-2.5 gap-0.5'
      )}>
        {NAV_ITEMS.map(({ label: itemLabel, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              title={isCollapsed ? itemLabel : undefined}
              className={cn(
                'group relative flex items-center gap-2 rounded-lg py-[7px] text-[12.5px] font-medium transition-all duration-150',
                active
                  ? 'bg-dl-blue-pale/70 text-dl-blue'
                  : 'text-dl-text/75 hover:bg-dl-surface hover:text-dl-navy',
                isCollapsed ? 'md:justify-center md:px-0 md:py-2' : 'px-2'
              )}
            >
              {/* Active left bar */}
              {active && !isCollapsed && (
                <span className="absolute left-0 top-1/2 h-3.5 w-[2px] -translate-y-1/2 rounded-r bg-[#ff894c]" />
              )}

              {/* Icon */}
              <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                <Icon className={cn(
                  'h-[13px] w-[13px] transition-colors',
                  active ? 'text-dl-blue' : 'text-dl-muted group-hover:text-dl-text'
                )}
                />
              </div>

              {/* Label */}
              <span className={cn(
                'flex-1 transition-all duration-200',
                isCollapsed ? 'md:hidden' : ''
              )}>
                {itemLabel}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* ── ⌘K hint + theme toggle ── */}
      {!isCollapsed && (
        <div className="px-4 pb-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('toggle-command-palette'))
              onClose()
            }}
            className="flex flex-1 items-center gap-2 rounded-lg bg-dl-surface px-2.5 py-[7px] hover:text-dl-blue transition-all cursor-pointer text-left focus:outline-none group"
          >
            <Command className="h-3 w-3 shrink-0 text-dl-muted group-hover:text-dl-blue transition-colors" />
            <span className="flex-1 text-[11px] text-dl-muted group-hover:text-dl-blue transition-colors">Quick search</span>
            <span className="flex items-center gap-0.5 rounded bg-dl-bg px-1 py-0.5 text-[9.5px] font-semibold text-dl-muted">
              ⌘K
            </span>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-dl-border bg-dl-surface text-dl-muted transition-all hover:border-dl-blue hover:text-dl-blue"
            aria-label="Toggle dark mode"
          >
            {themeMounted && theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}
      {isCollapsed && (
        <div className="px-2 pb-2 flex justify-center">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-dl-border bg-dl-surface text-dl-muted transition-all hover:border-dl-blue hover:text-dl-blue"
            aria-label="Toggle dark mode"
          >
            {themeMounted && theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}

      {/* ── Help + Feedback ── */}
      <div className={cn(
        'border-t border-dl-border px-2.5 py-1.5 flex flex-col gap-px',
        isCollapsed ? 'md:px-2' : ''
      )}>
        <button
          type="button"
          onClick={() => setFeedbackOpen(true)}
          title={isCollapsed ? 'Share Feedback' : undefined}
          className={cn(
            'flex items-center gap-2 rounded-lg py-[7px] text-[11.5px] font-medium text-dl-muted hover:bg-dl-surface hover:text-dl-text transition-all duration-150',
            isCollapsed ? 'md:justify-center md:px-0' : 'px-2'
          )}
        >
          <div className="flex h-4 w-4 shrink-0 items-center justify-center">
            <MessageSquarePlus className="h-[13px] w-[13px]" />
          </div>
          <span className={cn('transition-all duration-200', isCollapsed ? 'md:hidden' : '')}>
            Share Feedback
          </span>
        </button>
        <a
          href="mailto:aryanpachori03@gmail.com"
          title={isCollapsed ? 'Help & Support' : undefined}
          className={cn(
            'flex items-center gap-2 rounded-lg py-[7px] text-[11.5px] font-medium text-dl-muted hover:bg-dl-surface hover:text-dl-text transition-all duration-150',
            isCollapsed ? 'md:justify-center md:px-0' : 'px-2'
          )}
        >
          <div className="flex h-4 w-4 shrink-0 items-center justify-center">
            <HelpCircle className="h-[13px] w-[13px]" />
          </div>
          <span className={cn('transition-all duration-200', isCollapsed ? 'md:hidden' : '')}>
            Help &amp; Support
          </span>
        </a>
      </div>
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

      {/* ── Profile ── */}
      <div className={cn(
        'border-t border-dl-border p-2.5',
        isCollapsed ? 'md:px-2' : ''
      )}>
        <div ref={profileRef} className="relative w-full">
          {/* Profile popover */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  'absolute bottom-16 left-0 z-50 flex flex-col rounded-2xl border border-dl-border bg-dl-bg shadow-2xl overflow-hidden',
                  isCollapsed ? 'md:left-full md:ml-2 md:bottom-0 w-52' : 'w-full'
                )}
              >
                {/* Profile header */}
                <div className="px-4 py-3 bg-dl-surface border-b border-dl-border">
                  <div className="flex items-center gap-3">
                    <Image
                      src={avatarUrl(user?.fullName ?? '', user?.email ?? '')}
                      alt="Avatar"
                      width={36}
                      height={36}
                      className="h-9 w-9 shrink-0 rounded-full shadow-sm"
                      unoptimized
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-dl-navy">
                        {user?.fullName ?? user?.nickname ?? 'User'}
                      </p>
                      <p className="truncate text-[11px] text-dl-muted">{user?.email}</p>
                    </div>
                  </div>
                  <span
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                    style={{ background: chip.bg, color: chip.text }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: chip.text }} />
                    {chip.label} Plan
                  </span>
                </div>
                {/* Actions */}
                <div className="p-1.5">
                  <Link
                    href="/profile"
                    onClick={() => { setProfileOpen(false); onClose() }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-medium text-dl-text hover:bg-dl-surface hover:text-dl-blue transition-colors"
                  >
                    <User className="h-3.5 w-3.5" />
                    Profile settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); onClose(); signOut() }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile trigger button */}
          <button
            type="button"
            onClick={() => setProfileOpen(p => !p)}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition-all duration-150 hover:bg-dl-surface focus:outline-none',
              isCollapsed ? 'md:justify-center' : ''
            )}
          >
            <Image
              src={avatarUrl(user?.fullName ?? '', user?.email ?? '')}
              alt="Avatar"
              width={26}
              height={26}
              className="h-[26px] w-[26px] shrink-0 rounded-full shadow-sm"
              unoptimized
            />
            <div className={cn('flex-1 min-w-0', isCollapsed ? 'md:hidden' : '')}>
              <p className="truncate text-[11.5px] font-semibold text-dl-navy">
                {user?.nickname ?? user?.fullName ?? user?.email ?? '…'}
              </p>
              <p className="truncate text-[10px] text-dl-muted">{user?.email}</p>
            </div>
            <ChevronRight className={cn(
              'h-3.5 w-3.5 text-dl-muted transition-transform duration-150',
              profileOpen ? 'rotate-90' : '',
              isCollapsed ? 'md:hidden' : ''
            )} />
          </button>
        </div>
      </div>
    </aside>
  )
}
