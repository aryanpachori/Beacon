'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, LayoutDashboard, Package, Bell, GitBranch,
  CreditCard, Zap, X, ArrowRight, Command,
} from 'lucide-react'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  action: () => void
  keywords?: string[]
  group: string
}

function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }

    function onToggle() {
      setOpen(prev => !prev)
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('toggle-command-palette', onToggle)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('toggle-command-palette', onToggle)
    }
  }, [])

  return { open, setOpen }
}

export function CommandPalette() {
  const router = useRouter()
  const { open, setOpen } = useCommandPalette()
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const navigate = useCallback((path: string) => {
    setOpen(false)
    setQuery('')
    router.push(path)
  }, [router, setOpen])

  const ALL_ITEMS: CommandItem[] = [
    {
      id: 'dashboard', label: 'Dashboard', description: 'Overview & analytics',
      icon: LayoutDashboard, action: () => navigate('/dashboard'),
      group: 'Navigation', keywords: ['home', 'overview', 'analytics'],
    },
    {
      id: 'packages', label: 'Packages', description: 'Browse all monitored packages',
      icon: Package, action: () => navigate('/packages'),
      group: 'Navigation', keywords: ['deps', 'dependencies', 'npm'],
    },
    {
      id: 'alerts', label: 'Alerts', description: 'View fired alerts',
      icon: Bell, action: () => navigate('/alerts'),
      group: 'Navigation', keywords: ['notifications', 'warnings'],
    },
    {
      id: 'repos', label: 'Repositories', description: 'Manage connected repos',
      icon: GitBranch, action: () => navigate('/repos'),
      group: 'Navigation', keywords: ['github', 'repos', 'connect'],
    },
    {
      id: 'integrations', label: 'Integrations', description: 'Connect Slack, Jira & more',
      icon: Zap, action: () => navigate('/integrations'),
      group: 'Navigation', keywords: ['slack', 'webhook', 'jira'],
    },
    {
      id: 'billing', label: 'Billing & Plan', description: 'Manage subscription',
      icon: CreditCard, action: () => navigate('/billing'),
      group: 'Navigation', keywords: ['plan', 'pro', 'upgrade', 'payment'],
    },
  ]

  const filtered = query.trim() === ''
    ? ALL_ITEMS
    : ALL_ITEMS.filter(item => {
      const q = query.toLowerCase()
      return (
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.keywords?.some(k => k.includes(q))
      )
    })

  // Group items
  const groups = Array.from(new Set(filtered.map(i => i.group)))

  useEffect(() => {
    setActiveIdx(0)
  }, [query])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
    }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx(prev => Math.min(prev + 1, filtered.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx(prev => Math.max(prev - 1, 0))
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        filtered[activeIdx]?.action()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, filtered, activeIdx])

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  let globalIdx = -1

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Centering Wrapper */}
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 pointer-events-none">
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-dl-border bg-dl-bg shadow-2xl pointer-events-auto"
            >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-dl-border px-4 py-3.5">
              <Search className="h-4 w-4 shrink-0 text-dl-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search commands, pages, actions…"
                className="flex-1 bg-transparent text-[14px] font-medium text-dl-navy placeholder:text-dl-border outline-none"
              />
              <button
                onClick={() => setOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-md border border-dl-border text-dl-muted hover:bg-dl-surface transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[320px] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dl-surface">
                    <Search className="h-5 w-5 text-dl-border" />
                  </div>
                  <p className="text-[13px] font-medium text-dl-muted">No results for &ldquo;{query}&rdquo;</p>
                </div>
              ) : (
                groups.map(group => {
                  const groupItems = filtered.filter(i => i.group === group)
                  return (
                    <div key={group}>
                      <p className="mb-1 mt-2 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-dl-muted">
                        {group}
                      </p>
                      {groupItems.map(item => {
                        globalIdx++
                        const idx = globalIdx
                        const isActive = idx === activeIdx
                        return (
                          <button
                            key={item.id}
                            data-idx={idx}
                            onClick={item.action}
                            onMouseEnter={() => setActiveIdx(idx)}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isActive ? 'bg-dl-surface' : ''
                            }`}
                          >
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                              isActive ? 'bg-dl-blue/10' : 'bg-dl-surface'
                            }`}>
                              <item.icon className={`h-4 w-4 ${isActive ? 'text-dl-blue' : 'text-dl-muted'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-[13px] font-semibold ${isActive ? 'text-dl-navy' : 'text-dl-text'}`}>
                                {item.label}
                              </p>
                              {item.description && (
                                <p className="text-[11px] text-dl-muted">{item.description}</p>
                              )}
                            </div>
                            {isActive && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-dl-blue" />}
                          </button>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-3 border-t border-dl-border px-4 py-2.5">
              <span className="flex items-center gap-1 text-[10px] text-dl-muted">
                <kbd className="rounded border border-dl-border bg-dl-surface px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1 text-[10px] text-dl-muted">
                <kbd className="rounded border border-dl-border bg-dl-surface px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
                open
              </span>
              <span className="flex items-center gap-1 text-[10px] text-dl-muted">
                <kbd className="rounded border border-dl-border bg-dl-surface px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd>
                close
              </span>
              <div className="ml-auto flex items-center gap-1 text-[10px] text-dl-muted">
                <Command className="h-3 w-3" />
                <span>K</span>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
