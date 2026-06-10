'use client'

import { useEffect, useRef, useState } from 'react'
import { openScanProgressStream, type ScanProgressEvent } from '@/lib/api'

const initial: ScanProgressEvent = {
  status: 'pending',
  total: 0,
  scanned: 0,
  scored: 0,
}

const MAX_RECONNECT_ATTEMPTS = 3
const RECONNECT_DELAY_MS = 3000
const POLL_INTERVAL_MS = 5000

export function useScanProgressStream(enabled: boolean) {
  const [progress, setProgress] = useState<ScanProgressEvent>(initial)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(false)
  const [reconnectStatus, setReconnectStatus] = useState<'idle' | 'reconnecting' | 'polling'>('idle')
  const reconnectAttemptsRef = useRef(0)
  const closeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!enabled) return

    setError(false)
    setReconnectStatus('idle')
    reconnectAttemptsRef.current = 0

    function connect() {
      closeRef.current = openScanProgressStream(
        (event) => {
          setConnected(true)
          setReconnectStatus('idle')
          reconnectAttemptsRef.current = 0
          // Never let counter go backwards
          setProgress(prev => ({
            ...event,
            scanned: Math.max(prev.scanned, event.scanned),
            scored: Math.max(prev.scored, event.scored),
          }))
        },
        () => {
          setConnected(false)
          handleDisconnect()
        }
      )
    }

    function handleDisconnect() {
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current += 1
        setReconnectStatus('reconnecting')
        setTimeout(() => {
          if (closeRef.current) closeRef.current()
          connect()
        }, RECONNECT_DELAY_MS)
      } else {
        setError(true)
        setReconnectStatus('polling')
        // Fall back to polling
        const pollInterval = setInterval(() => {
          openScanProgressStream(
            (event) => {
              setProgress(prev => ({
                ...event,
                scanned: Math.max(prev.scanned, event.scanned),
                scored: Math.max(prev.scored, event.scored),
              }))
              if (event.status === 'complete' || event.status === 'failed') {
                clearInterval(pollInterval)
              }
            },
            () => { /* ignore poll errors */ }
          )
        }, POLL_INTERVAL_MS)
        closeRef.current = () => clearInterval(pollInterval)
      }
    }

    connect()

    return () => {
      if (closeRef.current) closeRef.current()
    }
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
    reconnectStatus,
    activeCount,
    percent,
    isComplete: progress.status === 'complete',
    isFailed: progress.status === 'failed',
  }
}
