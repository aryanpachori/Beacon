import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Finding } from '../engine'
import { detectInfraDrift, scanInfra, scanNetwork } from '../engine'

/**
 * Runtime drift monitor — re-checks infra/network posture vs a last-known-good
 * baseline JSON file. No-ops unless BEACON_INFRA_BASELINE and BEACON_INFRA_SCAN_PATHS
 * are configured.
 *
 * Env:
 *   BEACON_INFRA_BASELINE   — path to baseline findings JSON (array of Finding)
 *   BEACON_INFRA_SCAN_PATHS — comma-separated file paths to re-scan
 *   BEACON_INFRA_DRIFT_UPDATE — when "1", write current scan back to baseline after run
 */
export async function runInfraDriftCheck(): Promise<void> {
  const baselinePath = process.env.BEACON_INFRA_BASELINE
  const pathsEnv = process.env.BEACON_INFRA_SCAN_PATHS

  if (!baselinePath || !pathsEnv) {
    return
  }

  const filePaths = pathsEnv
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => resolve(p))

  if (filePaths.length === 0) return

  let baseline: Finding[] = []
  if (existsSync(baselinePath)) {
    try {
      baseline = JSON.parse(readFileSync(baselinePath, 'utf-8')) as Finding[]
    } catch (err) {
      console.error('[infra-drift] failed to parse baseline:', err)
      return
    }
  }

  const drifted = detectInfraDrift(filePaths, baseline)

  if (drifted.length === 0) {
    console.log('[infra-drift] no meaningful drift')
  } else {
    console.warn(`[infra-drift] ${drifted.length} new/worsened finding(s):`)
    for (const d of drifted) {
      console.warn(`  [${d.drift}] ${d.severity} ${d.category} ${d.file_path}: ${d.description}`)
    }
  }

  if (process.env.BEACON_INFRA_DRIFT_UPDATE === '1') {
    const current = [...scanInfra(filePaths), ...scanNetwork(filePaths)]
    writeFileSync(baselinePath, JSON.stringify(current, null, 2))
    console.log(`[infra-drift] baseline updated at ${baselinePath}`)
  }
}
