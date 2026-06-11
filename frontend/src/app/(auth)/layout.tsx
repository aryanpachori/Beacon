'use client'

import { useEffect } from 'react'
import { SiteLogo } from '@/components/layout/SiteLogo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const currentTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', currentTheme === 'dark' ? 'app' : 'light')
  }, [])

  return (
    <div className="site-shell flex min-h-screen flex-col">
      <header className="flex h-[60px] items-center px-6">
        <SiteLogo />
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}
