import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const scrollPositions: Record<string, number> = {}

export function useScrollMemory() {
  const pathname = usePathname()
  const prevPath = useRef(pathname)

  useEffect(() => {
    const handleScroll = () => {
      scrollPositions[prevPath.current] = window.scrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const saved = scrollPositions[pathname]
    if (saved !== undefined) {
      requestAnimationFrame(() => window.scrollTo(0, saved))
    } else {
      window.scrollTo(0, 0)
    }
    prevPath.current = pathname
  }, [pathname])
}
