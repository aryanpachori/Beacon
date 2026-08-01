'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard, Package,
  CreditCard, User, LogOut, ChevronLeft, ChevronRight,
  HelpCircle,
  Command, MessageSquarePlus, Radar,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { FeedbackModal } from '@/components/layout/FeedbackModal'
import { useAppData } from '@/context/AppDataContext'
import { avatarUrl } from '@/lib/gravatar'
import { cn } from '@/lib/utils'

/* ── Plan label ──────────────────────────────────────────────────────── */
function planChip(plan: string) {
  if (plan === 'pro')  return { label: 'Pro' }
  if (plan === 'team') return { label: 'Team' }
  return { label: 'Free' }
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
        'fixed top-4 left-4 bottom-4 z-30 flex flex-col rounded-[26px] bg-[#0d0d0d] transition-[width,transform] duration-300 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-[calc(100%+16px)] md:translate-x-0',
        isCollapsed ? 'w-[250px] md:w-[84px]' : 'w-[250px] md:w-[250px]'
      )}
      style={{ fontFamily: 'var(--font-sidebar), var(--font-inter), sans-serif' }}
    >
      {/* ── Logo row ── */}
      <div className={cn(
        'flex h-[52px] shrink-0 items-center justify-between px-4',
        isCollapsed ? 'md:justify-center md:px-3' : ''
      )}>
        <SiteLogo
          className={cn(
            'text-[14px] font-semibold tracking-tight text-white transition-all duration-200',
            isCollapsed ? 'md:hidden' : ''
          )}
          iconClassName="rounded-[10px] overflow-hidden"
        />
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'flex items-center justify-center rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-all duration-150 focus:outline-none',
              isCollapsed ? 'md:mt-0' : 'hidden md:flex'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed
              ? <ChevronRight className="h-3.5 w-3.5" />
              : <ChevronLeft className="h-3.5 w-3.5" />
            }
          </button>
        )}
      </div>

      {/* ── Nav items (flat, no sections) ── */}
      <nav className={cn(
        'flex flex-1 flex-col overflow-y-auto py-2 transition-all duration-200',
        isCollapsed ? 'px-3.5 gap-1' : 'px-3.5 gap-1'
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
                'group flex items-center gap-3 rounded-2xl py-[11px] text-[13.5px] font-medium transition-all duration-150',
                active
                  ? 'bg-white text-[#0d0d0d] font-semibold'
                  : 'text-white/75 hover:bg-white/8 hover:text-white',
                isCollapsed ? 'md:justify-center md:px-0' : 'px-3.5'
              )}
            >
              <Icon className={cn(
                'h-[17px] w-[17px] shrink-0 transition-colors',
                active ? 'text-[#0d0d0d]' : 'text-white/55 group-hover:text-white'
              )}
              />
              <span className={cn(
                'flex-1 whitespace-nowrap transition-all duration-200',
                isCollapsed ? 'md:hidden' : ''
              )}>
                {itemLabel}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* ── Quick search ── */}
      {!isCollapsed && (
        <div className="px-3.5 pb-3.5">
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('toggle-command-palette'))
              onClose()
            }}
            className="flex w-full items-center gap-2.5 rounded-2xl border border-white/[0.14] bg-white/[0.04] px-3.5 py-[11px] hover:bg-white/[0.08] transition-all cursor-pointer text-left focus:outline-none group"
          >
            <Command className="h-3.5 w-3.5 shrink-0 text-white/50" />
            <span className="flex-1 text-[12.5px] text-white/45">Quick search</span>
            <span className="rounded-[5px] border border-white/[0.18] px-1.5 py-0.5 text-[10.5px] text-white/35">
              ⌘K
            </span>
          </button>
        </div>
      )}

      <div className="mx-3.5 h-px bg-white/10" />

      {/* ── Help + Feedback ── */}
      <div className={cn(
        'px-3.5 py-2 flex flex-col gap-0.5',
        isCollapsed ? 'md:px-3' : ''
      )}>
        <button
          type="button"
          onClick={() => setFeedbackOpen(true)}
          title={isCollapsed ? 'Share Feedback' : undefined}
          className={cn(
            'flex items-center gap-2.5 rounded-xl py-2 text-[12px] font-medium text-white/50 hover:bg-white/8 hover:text-white transition-all duration-150',
            isCollapsed ? 'md:justify-center md:px-0' : 'px-2.5'
          )}
        >
          <MessageSquarePlus className="h-[14px] w-[14px] shrink-0" />
          <span className={cn('transition-all duration-200', isCollapsed ? 'md:hidden' : '')}>
            Share Feedback
          </span>
        </button>
        <a
          href="mailto:aryanpachori03@gmail.com"
          title={isCollapsed ? 'Help & Support' : undefined}
          className={cn(
            'flex items-center gap-2.5 rounded-xl py-2 text-[12px] font-medium text-white/50 hover:bg-white/8 hover:text-white transition-all duration-150',
            isCollapsed ? 'md:justify-center md:px-0' : 'px-2.5'
          )}
        >
          <HelpCircle className="h-[14px] w-[14px] shrink-0" />
          <span className={cn('transition-all duration-200', isCollapsed ? 'md:hidden' : '')}>
            Help &amp; Support
          </span>
        </a>
      </div>
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

      {/* ── Profile ── */}
      <div className={cn('p-3.5 pt-1.5', isCollapsed ? 'md:px-3' : '')}>
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
                <div className="px-4 py-3 bg-dl-chip-bg border-b border-dl-border">
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
                  <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-dl-blue px-2.5 py-1 text-[10px] font-semibold text-white">
                    {chip.label} Plan
                  </span>
                </div>
                {/* Actions */}
                <div className="p-1.5">
                  <Link
                    href="/profile"
                    onClick={() => { setProfileOpen(false); onClose() }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-medium text-dl-text hover:bg-dl-chip-bg transition-colors"
                  >
                    <User className="h-3.5 w-3.5" />
                    Profile settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); onClose(); signOut() }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-medium text-dl-text hover:bg-dl-chip-bg transition-colors"
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
              'flex w-full items-center gap-2.5 rounded-2xl p-1.5 text-left transition-all duration-150 hover:bg-white/8 focus:outline-none',
              isCollapsed ? 'md:justify-center' : ''
            )}
          >
            <Image
              src={avatarUrl(user?.fullName ?? '', user?.email ?? '')}
              alt="Avatar"
              width={30}
              height={30}
              className="h-[30px] w-[30px] shrink-0 rounded-full"
              unoptimized
            />
            <div className={cn('flex-1 min-w-0', isCollapsed ? 'md:hidden' : '')}>
              <p className="truncate text-[12.5px] font-semibold text-white">
                {user?.nickname ?? user?.fullName ?? user?.email ?? '…'}
              </p>
              <p className="truncate text-[11px] text-white/40">{user?.email}</p>
            </div>
            <ChevronRight className={cn(
              'h-3.5 w-3.5 text-white/40 transition-transform duration-150',
              profileOpen ? 'rotate-90' : '',
              isCollapsed ? 'md:hidden' : ''
            )} />
          </button>
        </div>
      </div>
    </aside>
  )
}
