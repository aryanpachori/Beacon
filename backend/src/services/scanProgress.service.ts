import { ScanStatus } from '@prisma/client'
import Redis from 'ioredis'
import { prisma } from '../db/client'
import { redis } from '../lib/redis'

export interface ScanProgressPayload {
  status: ScanStatus
  total: number
  scanned: number
  scored: number
}

function channelForUser(userId: string): string {
  return `scan-progress:${userId}`
}

export function formatScanProgress(
  status: ScanStatus,
  progress: { total?: number; scanned?: number; scored?: number } | null
): ScanProgressPayload {
  return {
    status,
    total: progress?.total ?? 0,
    scanned: progress?.scanned ?? 0,
    scored: progress?.scored ?? 0,
  }
}

export async function notifyScanProgress(installationDbId: string): Promise<void> {
  const row = await prisma.githubInstallation.findUnique({
    where: { id: installationDbId },
    select: { userId: true, scanStatus: true, scanProgress: true },
  })
  if (!row) return

  const payload = formatScanProgress(
    row.scanStatus,
    row.scanProgress as { total?: number; scanned?: number; scored?: number }
  )

  await redis.publish(channelForUser(row.userId), JSON.stringify(payload))
}

export async function getLatestScanProgress(userId: string): Promise<ScanProgressPayload | null> {
  const row = await prisma.githubInstallation.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { scanStatus: true, scanProgress: true },
  })
  if (!row) return null
  return formatScanProgress(
    row.scanStatus,
    row.scanProgress as { total?: number; scanned?: number; scored?: number }
  )
}

export function subscribeScanProgress(
  userId: string,
  onEvent: (payload: ScanProgressPayload) => void
): () => void {
  const sub: Redis = redis.duplicate()

  sub.subscribe(channelForUser(userId)).catch((err) => {
    console.error('Scan progress subscribe failed:', err)
  })

  sub.on('message', (_channel, message) => {
    try {
      onEvent(JSON.parse(message) as ScanProgressPayload)
    } catch {
      // ignore malformed payloads
    }
  })

  return () => {
    sub.unsubscribe().catch(() => {})
    sub.quit().catch(() => {})
  }
}
