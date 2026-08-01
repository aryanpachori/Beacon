'use client'

import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { NavSidebar } from '@/components/layout/NavSidebar'
import { CommandPalette } from '@/components/command/CommandPalette'
import { useScrollMemory } from '@/hooks/useScrollMemory'
import { cn } from '@/lib/utils'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  useScrollMemory()

  useEffect(() => {
    const collapsed = localStorage.getItem('dl_sidebar_collapsed') === 'true'
    setIsCollapsed(collapsed)
  }, [])

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('dl_sidebar_collapsed', String(next))
      return next
    })
  }

  return (
    <div className="flex min-h-screen bg-dl-bg">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {!sidebarOpen && (
        <button
          type="button"
          className="fixed left-4 top-4 z-40 rounded-lg border border-dl-border bg-dl-bg p-2 shadow-sm md:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-dl-text" />
        </button>
      )}

      <NavSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      <CommandPalette />

      <main
        className={cn(
          'ml-0 min-h-screen flex-1 transition-[margin] duration-300 ease-in-out',
          isCollapsed ? 'md:ml-[100px]' : 'md:ml-[266px]'
        )}
      >
        <div className="page-enter">
          {children}
        </div>
      </main>
    </div>
  )
}
