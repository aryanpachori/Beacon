import { Finding } from './finding'
import { scanInfra } from './scanInfra'
import { scanDependencies } from './scanDependencies'
import { scanNetwork } from './scanNetwork'
import { scanPromptInjection } from './scanPromptInjection'

export interface PreDeployResult {
  ok: boolean
  findings: Finding[]
  criticalCount: number
  highCount: number
}

export type PreDeployOptions = {
  /** When true (default), any critical or high finding fails the gate. */
  failOnHigh?: boolean
}

/**
 * Deploy-time gate: runs infra, dependency, network, and prompt-injection scanners
 * over the provided paths. Suitable for CI / terraform-apply wrappers.
 */
export function preDeployCheck(
  filePaths: string[],
  options: PreDeployOptions = {}
): PreDeployResult {
  const failOnHigh = options.failOnHigh !== false

  const findings = [
    ...scanInfra(filePaths),
    ...scanDependencies(filePaths),
    ...scanNetwork(filePaths),
    ...scanPromptInjection(filePaths),
  ]

  const criticalCount = findings.filter((f) => f.severity === 'critical').length
  const highCount = findings.filter((f) => f.severity === 'high').length
  const ok = criticalCount === 0 && (!failOnHigh || highCount === 0)

  return { ok, findings, criticalCount, highCount }
}
