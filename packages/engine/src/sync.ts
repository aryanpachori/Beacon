import type { Finding } from './finding'
import { resolveSyncCredentials } from './config'

export type SyncTrigger = 'cli' | 'mcp' | 'extension'

export type SyncOptions = {
  apiUrl?: string
  token?: string
  findings: Finding[]
  scanType: string
  triggeredBy: SyncTrigger
  repoId?: string
  /** When true, sync even if autoSync is disabled in config. */
  force?: boolean
}

/**
 * POST finding metadata to Beacon Agent Activity.
 * Uses BEACON_API_* env or `.beacon/config.json` from `beacon connect`.
 * Never sends source code — findings only.
 */
export async function syncFindings(opts: SyncOptions): Promise<{ synced: boolean; received?: number }> {
  const creds = resolveSyncCredentials({ apiUrl: opts.apiUrl, token: opts.token })
  if (!creds) return { synced: false }
  if (!opts.force && !creds.autoSync) return { synced: false }

  const res = await fetch(`${creds.apiUrl}/api/agent-activity/scans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${creds.token}`,
    },
    body: JSON.stringify({
      findings: opts.findings,
      scan_type: opts.scanType,
      triggered_by: opts.triggeredBy,
      repo_id: opts.repoId,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Beacon sync failed (${res.status}): ${text || res.statusText}`)
  }

  const body = (await res.json()) as { received?: number }
  return { synced: true, received: body.received }
}
