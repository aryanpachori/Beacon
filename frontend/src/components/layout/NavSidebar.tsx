'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard, Package,
  CreditCard, User, LogOut,
  Search, MessageSquarePlus, Radar,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { FeedbackModal } from '@/components/layout/FeedbackModal'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { useAppData } from '@/context/AppDataContext'
import { avatarUrl } from '@/lib/gravatar'
import { cn } from '@/lib/utils'

function planChip(plan: string) {
  if (plan === 'pro') return { label: 'Pro' }
  if (plan === 'team') return { label: 'Team' }
  return { label: 'Free' }
}

function initialsFrom(user: { fullName?: string | null; nickname?: string | null; email?: string | null } | null) {
  const name = user?.fullName?.trim() || user?.nickname?.trim() || user?.email?.trim() || 'U'
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Agent Activity', href: '/agent-activity', icon: Radar },
  { label: 'Dependency Tracker', href: '/dependency-tracker', icon: Package },
  { label: 'Billing', href: '/billing', icon: CreditCard },
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
  const initials = initialsFrom(user)

  return (
    <aside
      className={cn(
        'fixed z-30 flex flex-col bg-[#0d0d0d] transition-[width,transform,padding] duration-200 ease-out',
        'top-4 bottom-4 left-4 rounded-[26px]',
        open ? 'translate-x-0' : '-translate-x-[calc(100%+16px)] md:translate-x-0',
        isCollapsed
          ? 'w-[250px] px-[14px] py-[26px] md:w-[84px]'
          : 'w-[250px] px-[18px] py-[26px]'
      )}
      style={{ fontFamily: 'var(--font-sidebar), sans-serif' }}
    >
      {/* Logo + collapse */}
      <div
        className={cn(
          'mb-[30px] flex items-center gap-2 px-1.5',
          isCollapsed ? 'md:flex-col md:justify-center' : 'justify-between'
        )}
      >
        <SiteLogo
          href="/dashboard"
          onClick={onClose}
          variant="onDark"
          wordmark="Beacon"
          wordmarkClassName={cn(
            'whitespace-nowrap text-[18px] font-bold tracking-[-0.01em] text-white',
            isCollapsed && 'md:hidden'
          )}
        />

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] bg-white/[0.06] text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none',
              isCollapsed ? 'md:mt-2.5' : 'hidden md:flex'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              className={cn('transition-transform duration-200', isCollapsed ? '' : 'rotate-180')}
            >
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {NAV_ITEMS.map(({ label: itemLabel, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              title={isCollapsed ? itemLabel : undefined}
              className={cn(
                'beacon-nav-row group flex items-center gap-3 rounded-[14px] py-[11px] text-[13.5px] transition-colors duration-150',
                active
                  ? 'bg-white font-semibold text-[#0d0d0d]'
                  : 'font-medium text-white/75 hover:bg-white/[0.08] hover:text-white',
                isCollapsed ? 'md:justify-center md:px-0' : 'px-3.5'
              )}
            >
              <Icon
                className={cn(
                  'h-[17px] w-[17px] shrink-0',
                  active ? 'text-[#0d0d0d]' : 'text-white/55 group-hover:text-white'
                )}
                strokeWidth={active ? 2.2 : 2.1}
              />
              <span className={cn('whitespace-nowrap', isCollapsed ? 'md:hidden' : '')}>
                {itemLabel}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom: search + profile */}
      <div className="mt-auto flex flex-col gap-3.5">
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('toggle-command-palette'))
            onClose()
          }}
          title={isCollapsed ? 'Quick search' : undefined}
          className={cn(
            'flex items-center gap-2.5 rounded-[14px] border border-white/[0.14] bg-white/[0.04] py-[11px] text-left transition-colors hover:bg-white/[0.08] focus:outline-none',
            isCollapsed ? 'md:justify-center md:px-0' : 'px-[13px]'
          )}
        >
          <Search className="h-[15px] w-[15px] shrink-0 text-white/50" strokeWidth={2} />
          <span className={cn('flex-1 text-[12.5px] text-white/45', isCollapsed ? 'md:hidden' : '')}>
            Quick search
          </span>
          <span
            className={cn(
              'rounded-[5px] border border-white/[0.18] px-1.5 py-px text-[10.5px] text-white/35',
              isCollapsed ? 'md:hidden' : ''
            )}
          >
            ⌘K
          </span>
        </button>

        <div className="h-px bg-white/10" />

        <div ref={profileRef} className="relative">
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  'absolute bottom-14 left-0 z-50 flex w-full flex-col overflow-hidden rounded-2xl border border-[#e4e4e4] bg-white shadow-2xl',
                  isCollapsed ? 'md:bottom-0 md:left-full md:ml-2 md:w-52' : ''
                )}
              >
                <div className="border-b border-[#e4e4e4] bg-[#f5f5f5] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src={avatarUrl(user?.fullName ?? '', user?.email ?? '')}
                      alt="Avatar"
                      width={36}
                      height={36}
                      className="h-9 w-9 shrink-0 rounded-full"
                      unoptimized
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[#111]">
                        {user?.fullName ?? user?.nickname ?? 'User'}
                      </p>
                      <p className="truncate text-[11px] text-[#8a8a8a]">{user?.email}</p>
                    </div>
                  </div>
                  <span className="mt-2.5 inline-flex items-center rounded-full bg-[#111] px-2.5 py-1 text-[10px] font-semibold text-white">
                    {chip.label} Plan
                  </span>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/profile"
                    onClick={() => {
                      setProfileOpen(false)
                      onClose()
                    }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-medium text-[#111] hover:bg-[#f5f5f5]"
                  >
                    <User className="h-3.5 w-3.5" />
                    Profile settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => setFeedbackOpen(true)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-medium text-[#111] hover:bg-[#f5f5f5]"
                  >
                    <MessageSquarePlus className="h-3.5 w-3.5" />
                    Share feedback
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false)
                      onClose()
                      signOut()
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-medium text-[#111] hover:bg-[#f5f5f5]"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setProfileOpen((p) => !p)}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-[14px] px-1.5 py-1.5 text-left transition-colors hover:bg-white/[0.08] focus:outline-none',
              isCollapsed ? 'md:justify-center' : ''
            )}
          >
            <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-white text-[13px] font-bold text-[#0d0d0d]">
              {initials}
            </span>
            <div className={cn('min-w-0 flex-1', isCollapsed ? 'md:hidden' : '')}>
              <p className="truncate text-[13.5px] font-semibold text-white">
                {user?.nickname ?? user?.fullName ?? user?.email ?? '…'}
              </p>
              <p className="max-w-[145px] truncate text-[11px] text-white/40">{user?.email}</p>
            </div>
          </button>
        </div>
      </div>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </aside>
  )
}
