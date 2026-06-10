'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { NavSidebar } from '@/components/layout/NavSidebar'
import { useScrollMemory } from '@/hooks/useScrollMemory'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useScrollMemory()

  return (
    <div
      data-theme="app"
      className="flex min-h-screen"
      style={{ background: 'var(--dl-page)' }}
    >
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {!sidebarOpen && (
        <button
          type="button"
          className="fixed left-4 top-4 z-40 rounded-lg bg-dl-nav p-2 md:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-dl-sage-light" />
        </button>
      )}

      <NavSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main
        className="ml-0 min-h-screen flex-1 md:ml-[220px]"
        style={{ background: 'var(--dl-page)' }}
      >
        {children}
      </main>
    </div>
  )
}
