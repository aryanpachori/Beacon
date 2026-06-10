import { useState, useEffect } from 'react'

function getRelativeTime(date: string | Date): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  if (isNaN(then)) return '—'
  const diff = now - then
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export function useRelativeTime(date: string | Date | null | undefined): string {
  const [label, setLabel] = useState(() => (date ? getRelativeTime(date) : '—'))

  useEffect(() => {
    if (!date) return
    setLabel(getRelativeTime(date))
    const diff = Date.now() - new Date(date).getTime()
    if (diff < 3_600_000) {
      const interval = setInterval(() => setLabel(getRelativeTime(date)), 30_000)
      return () => clearInterval(interval)
    }
  }, [date])

  return label
}
