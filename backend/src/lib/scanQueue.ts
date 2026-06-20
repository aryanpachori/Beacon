import type { SignalCollectJobData } from './queue'

/**
 * In-process async scan queue — replaces BullMQ signal-collect queue.
 * Zero Redis commands. Concurrency=1 (jobs run sequentially).
 * Safe for single-process deployments (Render single instance).
 * If the process restarts mid-scan the job is lost — daily cron will retry next day.
 */

type ScanProcessor = (data: SignalCollectJobData) => Promise<void>

let processor: ScanProcessor | null = null
let running = false
const pending: SignalCollectJobData[] = []

export function registerScanProcessor(fn: ScanProcessor): void {
  processor = fn
}

export function enqueueScan(data: SignalCollectJobData): void {
  pending.push(data)
  if (!running) void drain()
}

async function drain(): Promise<void> {
  if (running || pending.length === 0 || !processor) return
  running = true
  while (pending.length > 0) {
    const job = pending.shift()!
    try {
      await processor(job)
    } catch (err) {
      console.error(JSON.stringify({
        event: 'scan_job_failed',
        triggered_by: job.triggered_by,
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      }))
    }
  }
  running = false
}
