export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type FindingStatus = 'open' | 'fixed' | 'ignored' | 'resolved'

/** Shared schema — contract with BE-1 (scan_code) and FE/Ext (MCP/CLI/extension/dashboard). */
export interface Finding {
  id: string
  severity: Severity
  category: string
  file_path: string
  line_range: [number, number] | null
  description: string
  suggested_fix: string
  auto_fixable: boolean
  detected_at: string
  status: FindingStatus
}

let counter = 0

export function makeFinding(
  input: Omit<Finding, 'id' | 'detected_at' | 'status'>
): Finding {
  counter += 1
  return {
    ...input,
    id: `bcn_${Date.now().toString(36)}_${counter}`,
    detected_at: new Date().toISOString(),
    status: 'open',
  }
}
