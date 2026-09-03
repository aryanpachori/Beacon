#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import {
  collectFiles,
  isCodeFile,
  isInfraFile,
  isManifestFile,
  preDeployCheck,
  resolveSyncCredentials,
  scanCode,
  scanDependencies,
  scanInfra,
  scanNetwork,
  scanPromptInjection,
  syncFindings,
  writeSyncCredentials,
  type Finding,
} from '@forgefastlabs/beacon-engine'

function packageRoot(): string {
  return resolve(__dirname, '..')
}

function printHelp(): void {
  console.log(`Beacon CLI — local-first security scans

Usage:
  beacon init [--hooks]              Scaffold agent rules + optional pre-commit hook
  beacon connect --url <api> --token <jwt>
                                     Link this machine to your Beacon dashboard
  beacon scan [options]              Run scanners (auto-syncs when connected)
  beacon pre-commit                  Scan for critical findings (git hook entry)

Scan options:
  --path <dir>              Root to scan (default: cwd; repeatable)
  --type <name>             security | dependencies | infra | all | predeploy (default: all)
  --json                    Machine-readable JSON output
  --fail-on high|critical   Exit 1 when findings at/above severity
  --sync                    Force sync to dashboard
  --no-sync                 Skip dashboard sync even if connected
  --help                    Show help

Dashboard sync:
  1. Open Agent Activity → "Connect this machine"
  2. Run the copied \`beacon connect\` command
  3. Scans sync finding metadata automatically (never source code)
`)
}

function parseArgs(argv: string[]) {
  const args = argv.slice(2)
  const cmd = args[0] ?? 'help'
  const paths: string[] = []
  let type = 'all'
  let json = false
  let sync: boolean | null = null
  let hooks = false
  let failOn: 'high' | 'critical' | null = null
  let url: string | null = null
  let token: string | null = null

  for (let i = 1; i < args.length; i++) {
    const a = args[i]!
    if (a === '--help' || a === '-h') {
      return { cmd: 'help', paths, type, json, sync, hooks, failOn, url, token }
    }
    if (a === '--json') json = true
    else if (a === '--sync') sync = true
    else if (a === '--no-sync') sync = false
    else if (a === '--hooks') hooks = true
    else if (a === '--url') url = args[++i] ?? null
    else if (a === '--token') token = args[++i] ?? null
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

  return { cmd, paths, type, json, sync, hooks, failOn, url, token }
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

async function maybeSyncScan(
  findings: Finding[],
  scanType: string,
  syncFlag: boolean | null,
  json: boolean
): Promise<void> {
  const creds = resolveSyncCredentials()
  const forceSync = syncFlag === true
  const shouldSync = forceSync || (syncFlag !== false && !!creds && creds.autoSync)
  if (!shouldSync) {
    if (forceSync && !creds && !json) {
      console.error(
        'Sync requested but not connected. On Agent Activity, click “Connect this machine”, then run the copied beacon connect command.'
      )
    }
    return
  }
  try {
    const r = await syncFindings({
      findings,
      scanType,
      triggeredBy: 'cli',
      force: forceSync,
    })
    if (r.synced && !json) {
      console.error(`Synced ${r.received ?? findings.length} finding(s) to Beacon Agent Activity.`)
    }
  } catch (err) {
    console.error(`Sync failed: ${err instanceof Error ? err.message : err}`)
  }
}

async function cmdScan(opts: ReturnType<typeof parseArgs>): Promise<number> {
  const { findings, scanType, ok } = runScan(opts.paths, opts.type)
  await maybeSyncScan(findings, scanType, opts.sync, opts.json)

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

function cmdConnect(url: string | null, token: string | null): number {
  if (!url || !token) {
    console.error('Usage: beacon connect --url <apiUrl> --token <token>')
    console.error('Get a command from Agent Activity → Connect this machine.')
    return 1
  }
  const { project, home } = writeSyncCredentials(url, token)
  console.log('Connected to Beacon dashboard.')
  console.log(`  Wrote ${project}`)
  console.log(`  Wrote ${home}`)
  console.log('Scans will now sync finding metadata to Agent Activity automatically.')
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
  const existing = join(beaconDir, 'config.json')
  if (!existsSync(existing)) {
    writeFileSync(
      existing,
      JSON.stringify(
        {
          version: 1,
          sync: { autoSync: true },
        },
        null,
        2
      ) + '\n'
    )
  }

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
      }
    }
  } else {
    console.log('Tip: re-run with --hooks to install a git pre-commit scanner.')
  }

  if (resolveSyncCredentials()) {
    console.log('Dashboard sync: already connected.')
  } else {
    console.log(
      '\nTo update Agent Activity on the website: open the dashboard → Connect this machine → run the copied beacon connect command.'
    )
  }
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
  if (opts.cmd === 'connect') {
    process.exit(cmdConnect(opts.url, opts.token))
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
        sync: null,
        hooks: false,
        failOn: 'critical',
        url: null,
        token: null,
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
