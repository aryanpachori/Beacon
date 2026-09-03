import type { Finding } from './finding'

export type SyncTrigger = 'cli' | 'mcp' | 'extension'

export type SyncOptions = {
  apiUrl?: string
  token?: string
  findings: Finding[]
  scanType: string
  triggeredBy: SyncTrigger
  repoId?: string
}

/**
 * Optionally POST finding metadata to Beacon Agent Activity.
 * No-ops when BEACON_API_URL / BEACON_API_TOKEN (or explicit opts) are unset.
 * Never sends source code — findings only.
 */
export async function syncFindings(opts: SyncOptions): Promise<{ synced: boolean; received?: number }> {
  const apiUrl = (opts.apiUrl ?? process.env.BEACON_API_URL ?? '').replace(/\/$/, '')
  const token = opts.token ?? process.env.BEACON_API_TOKEN ?? process.env.BEACON_ACCESS_TOKEN
  if (!apiUrl || !token) {
    return { synced: false }
  }

  const res = await fetch(`${apiUrl}/api/agent-activity/scans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
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
