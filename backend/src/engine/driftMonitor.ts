import { createHash } from 'node:crypto'
import { Finding } from './finding'
import { scanInfra } from './scanInfra'
import { scanNetwork } from './scanNetwork'

export type DriftFinding = Finding & {
  drift: 'new' | 'worsened'
  previousSeverity?: Finding['severity']
}

const SEVERITY_RANK: Record<Finding['severity'], number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
}

/** Stable key for comparing findings across scans (ignores id / timestamps). */
export function findingKey(f: Pick<Finding, 'category' | 'file_path' | 'description'>): string {
  return createHash('sha256')
    .update(`${f.category}|${f.file_path}|${f.description}`)
    .digest('hex')
    .slice(0, 16)
}

/**
 * Compare a baseline Finding set to a fresh scan. Returns only new findings
 * or findings whose severity increased (worsened).
 */
export function diffFindings(baseline: Finding[], current: Finding[]): DriftFinding[] {
  const baseMap = new Map(baseline.map((f) => [findingKey(f), f]))
  const drifted: DriftFinding[] = []

  for (const f of current) {
    const key = findingKey(f)
    const prev = baseMap.get(key)
    if (!prev) {
      drifted.push({ ...f, drift: 'new' })
      continue
    }
    if (SEVERITY_RANK[f.severity] > SEVERITY_RANK[prev.severity]) {
      drifted.push({ ...f, drift: 'worsened', previousSeverity: prev.severity })
    }
  }

  return drifted
}

/**
 * Re-scan infra + network posture and return meaningful drift vs last-known-good.
 */
export function detectInfraDrift(filePaths: string[], baseline: Finding[]): DriftFinding[] {
  const current = [...scanInfra(filePaths), ...scanNetwork(filePaths)]
  return diffFindings(baseline, current)
}
