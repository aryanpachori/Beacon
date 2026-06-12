'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

function readTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('dl_theme') as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function useTheme(): [Theme, () => void, boolean] {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const initial = readTheme()
    setTheme(initial)
    applyTheme(initial)
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('dl_theme', next)
      applyTheme(next)
      return next
    })
  }

  return [theme, toggleTheme, mounted]
}
