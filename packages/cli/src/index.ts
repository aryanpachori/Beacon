#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import {
  collectFiles,
  isCodeFile,
  isInfraFile,
  isManifestFile,
  preDeployCheck,
  scanCode,
  scanDependencies,
  scanInfra,
  scanNetwork,
  scanPromptInjection,
  syncFindings,
  type Finding,
} from '@forgefastlabs/beacon-engine'

function packageRoot(): string {
  return resolve(__dirname, '..')
}

function printHelp(): void {
  console.log(`Beacon CLI — local-first security scans

Usage:
  beacon init [--hooks]     Scaffold agent rules + optional pre-commit hook
  beacon scan [options]     Run scanners on the current project
  beacon pre-commit         Scan for critical findings (git hook entry)

Scan options:
  --path <dir>              Root to scan (default: cwd; repeatable)
  --type <name>             security | dependencies | infra | all | predeploy (default: all)
  --json                    Machine-readable JSON output
  --fail-on high|critical   Exit 1 when findings at/above severity
  --sync                    POST findings if BEACON_API_URL + BEACON_API_TOKEN set
  --help                    Show help

Env (optional sync):
  BEACON_API_URL            API base URL
  BEACON_API_TOKEN          Bearer access token
`)
}

function parseArgs(argv: string[]) {
  const args = argv.slice(2)
  const cmd = args[0] ?? 'help'
  const paths: string[] = []
  let type = 'all'
  let json = false
  let sync = false
  let hooks = false
  let failOn: 'high' | 'critical' | null = null

  for (let i = 1; i < args.length; i++) {
    const a = args[i]!
    if (a === '--help' || a === '-h') return { cmd: 'help', paths, type, json, sync, hooks, failOn }
    if (a === '--json') json = true
    else if (a === '--sync') sync = true
    else if (a === '--hooks') hooks = true
    else if (a === '--path' || a === '-p') {
      paths.push(args[++i] ?? '.')
    } else if (a === '--type' || a === '-t') {
      type = args[++i] ?? 'all'
    } else if (a === '--fail-on') {
      const v = args[++i]
      if (v === 'high' || v === 'critical') failOn = v
    } else if (!a.startsWith('-')) {
      paths.push(a)
    }
  }

  return { cmd, paths, type, json, sync, hooks, failOn }
}

function runScan(
  roots: string[],
  type: string
): { findings: Finding[]; scanType: string; ok?: boolean } {
  const resolved = roots.length ? roots.map((p) => resolve(p)) : [process.cwd()]

  if (type === 'security') {
    const files = collectFiles({ roots: resolved, include: isCodeFile })
    return {
      findings: [...scanCode(files), ...scanPromptInjection(files)],
      scanType: 'check_security',
    }
  }
  if (type === 'dependencies') {
    const files = collectFiles({ roots: resolved, include: isManifestFile })
    return { findings: scanDependencies(files), scanType: 'scan_dependencies' }
  }
  if (type === 'infra') {
    const files = collectFiles({
      roots: resolved,
      include: (p) => isInfraFile(p) || /\.(ya?ml|yml|tf|conf)$/i.test(p),
    })
    return {
      findings: [...scanInfra(files), ...scanNetwork(files)],
      scanType: 'scan_infra',
    }
  }
  if (type === 'predeploy') {
    const files = collectFiles({ roots: resolved })
    const result = preDeployCheck(files)
    return {
      findings: result.findings,
      scanType: 'pre_deploy_check',
      ok: result.ok,
    }
  }

  const code = collectFiles({ roots: resolved, include: isCodeFile })
  const manifests = collectFiles({ roots: resolved, include: isManifestFile })
  const infra = collectFiles({
    roots: resolved,
    include: (p) => isInfraFile(p) || /\.(ya?ml|yml|tf|conf)$/i.test(p),
  })
  return {
    findings: [
      ...scanCode(code),
      ...scanPromptInjection(code),
      ...scanDependencies(manifests),
      ...scanInfra(infra),
      ...scanNetwork(infra),
    ],
    scanType: 'all',
  }
}

function severityRank(s: Finding['severity']): number {
  return { low: 1, medium: 2, high: 3, critical: 4 }[s]
}

async function cmdScan(opts: ReturnType<typeof parseArgs>): Promise<number> {
  const { findings, scanType, ok } = runScan(opts.paths, opts.type)

  if (opts.sync) {
    try {
      const r = await syncFindings({
        findings,
        scanType,
        triggeredBy: 'cli',
      })
      if (r.synced && !opts.json) {
        console.error(`Synced ${r.received ?? findings.length} finding(s) to Beacon.`)
      }
    } catch (err) {
      console.error(`Sync failed: ${err instanceof Error ? err.message : err}`)
    }
  }

  if (opts.json) {
    console.log(JSON.stringify({ scanType, ok: ok ?? null, count: findings.length, findings }, null, 2))
  } else {
    console.log(`Beacon scan (${scanType}): ${findings.length} finding(s)`)
    if (ok === false) console.log('pre_deploy_check: BLOCK')
    if (ok === true) console.log('pre_deploy_check: OK')
    for (const f of findings) {
      const loc = f.line_range ? `${f.file_path}:${f.line_range[0]}` : f.file_path
      console.log(`  [${f.severity}] ${f.category}  ${loc}`)
      console.log(`    ${f.description}`)
    }
  }

  const threshold = opts.failOn ?? (opts.type === 'predeploy' ? 'high' : null)
  if (threshold) {
    const min = severityRank(threshold)
    if (findings.some((f) => severityRank(f.severity) >= min)) return 1
  }
  if (ok === false) return 1
  return 0
}

function cmdInit(hooks: boolean): number {
  const cwd = process.cwd()
  const rulesDir = join(cwd, '.cursor', 'rules')
  mkdirSync(rulesDir, { recursive: true })

  const root = packageRoot()
  const templateMdc = join(root, 'templates', 'beacon.mdc')
  const destMdc = join(rulesDir, 'beacon.mdc')
  const mcpTemplate = join(root, '..', 'mcp', 'templates', 'beacon.mdc')

  if (existsSync(templateMdc)) {
    copyFileSync(templateMdc, destMdc)
  } else if (existsSync(mcpTemplate)) {
    copyFileSync(mcpTemplate, destMdc)
  } else {
    writeFileSync(
      destMdc,
      `---
description: Call Beacon MCP security tools before commit/deploy
alwaysApply: true
---

Use Beacon MCP tools: check_security, scan_dependencies, scan_infra, pre_deploy_check.
`
    )
  }

  const beaconDir = join(cwd, '.beacon')
  mkdirSync(beaconDir, { recursive: true })
  writeFileSync(
    join(beaconDir, 'config.json'),
    JSON.stringify(
      {
        version: 1,
        sync: {
          apiUrlEnv: 'BEACON_API_URL',
          tokenEnv: 'BEACON_API_TOKEN',
        },
      },
      null,
      2
    ) + '\n'
  )

  console.log('Wrote .cursor/rules/beacon.mdc')
  console.log('Wrote .beacon/config.json')

  if (hooks) {
    const hookPath = join(cwd, '.git', 'hooks', 'pre-commit')
    if (!existsSync(join(cwd, '.git'))) {
      console.error('No .git directory — skip hooks (run inside a git repo).')
    } else {
      try {
        mkdirSync(dirname(hookPath), { recursive: true })
        writeFileSync(
          hookPath,
          `#!/bin/sh
# Beacon pre-commit — local scan (no source upload)
npx --yes @forgefastlabs/beacon-cli pre-commit
`,
          { mode: 0o755 }
        )
        console.log('Installed .git/hooks/pre-commit')
      } catch (err) {
        console.error(
          `Could not install pre-commit hook: ${err instanceof Error ? err.message : err}`
        )
        console.error('You can add it manually later with: beacon init --hooks')
      }
    }
  } else {
    console.log('Tip: re-run with --hooks to install a git pre-commit scanner.')
  }

  console.log('\nNext: connect MCP with `npx -y @forgefastlabs/beacon-mcp`')
  return 0
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv)
  if (opts.cmd === 'help' || opts.cmd === '--help' || opts.cmd === '-h') {
    printHelp()
    process.exit(0)
  }
  if (opts.cmd === 'init') {
    process.exit(cmdInit(opts.hooks))
  }
  if (opts.cmd === 'scan') {
    process.exit(await cmdScan(opts))
  }
  if (opts.cmd === 'pre-commit') {
    process.exit(
      await cmdScan({
        cmd: 'pre-commit',
        paths: ['.'],
        type: 'all',
        json: false,
        sync: false,
        hooks: false,
        failOn: 'critical',
      })
    )
  }
  console.error(`Unknown command: ${opts.cmd}`)
  printHelp()
  process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
