import { basename } from 'node:path'
import {
  isCodeFile,
  isInfraFile,
  isManifestFile,
  scanCode,
  scanDependencies,
  scanInfra,
  scanNetwork,
  scanPromptInjection,
  type Finding,
} from '@forgefastlabs/beacon-engine'

function safeScan(fn: () => Finding[]): Finding[] {
  try {
    return fn()
  } catch {
    return []
  }
}

/** Run the appropriate Beacon scanners for a single absolute file path. */
export function scanFilePath(filePath: string): Finding[] {
  const name = basename(filePath).toLowerCase()

  if (isManifestFile(filePath) || name === 'package.json') {
    return safeScan(() => scanDependencies([filePath]))
  }
  if (isInfraFile(filePath) || /\.(ya?ml|yml|tf|conf)$/i.test(filePath)) {
    return [
      ...safeScan(() => scanInfra([filePath])),
      ...safeScan(() => scanNetwork([filePath])),
    ]
  }
  if (isCodeFile(filePath)) {
    return [
      ...safeScan(() => scanCode([filePath])),
      ...safeScan(() => scanPromptInjection([filePath])),
    ]
  }

  return [
    ...safeScan(() => scanCode([filePath])),
    ...safeScan(() => scanDependencies([filePath])),
    ...safeScan(() => scanInfra([filePath])),
    ...safeScan(() => scanNetwork([filePath])),
    ...safeScan(() => scanPromptInjection([filePath])),
  ]
}

export function scanPaths(filePaths: string[]): Finding[] {
  const findings: Finding[] = []
  for (const p of filePaths) {
    findings.push(...scanFilePath(p))
  }
  return findings
}
