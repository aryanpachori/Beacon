'use client'

import { useEffect, useState } from 'react'
import { openScanProgressStream, type ScanProgressEvent } from '@/lib/api'

const initial: ScanProgressEvent = {
  status: 'pending',
  total: 0,
  scanned: 0,
  scored: 0,
}

export function useScanProgressStream(enabled: boolean) {
  const [progress, setProgress] = useState<ScanProgressEvent>(initial)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!enabled) return

    setError(false)
    const close = openScanProgressStream(
      (event) => {
        setConnected(true)
        setProgress(event)
      },
      () => setError(true)
    )

    return close
  }, [enabled])

  const activeCount =
    progress.status === 'scoring' ? progress.scored : progress.scanned

  const percent =
    progress.total > 0
      ? Math.min(100, Math.round((activeCount / progress.total) * 100))
      : 0

  return {
    progress,
    connected,
    error,
    activeCount,
    percent,
    isComplete: progress.status === 'complete',
    isFailed: progress.status === 'failed',
  }
}
