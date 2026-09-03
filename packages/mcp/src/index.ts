#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
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

const PathsSchema = {
  paths: z.array(z.string()).optional().describe('File or directory paths (default: cwd)'),
}

function resolveRoots(paths?: string[]): string[] {
  if (paths?.length) return paths
  return [process.cwd()]
}

function formatFindings(findings: Finding[]): string {
  if (findings.length === 0) return 'No findings.'
  return findings
    .map(
      (f, i) =>
        `${i + 1}. [${f.severity}] ${f.category} ${f.file_path}${
          f.line_range ? `:${f.line_range[0]}` : ''
        }\n   ${f.description}\n   Fix: ${f.suggested_fix}`
    )
    .join('\n\n')
}

async function maybeSync(findings: Finding[], scanType: string): Promise<string> {
  try {
    const result = await syncFindings({
      findings,
      scanType,
      triggeredBy: 'mcp',
    })
    if (result.synced) {
      return `\n\nSynced ${result.received ?? findings.length} finding(s) to Beacon dashboard.`
    }
    return ''
  } catch (err) {
    return `\n\nSync warning: ${err instanceof Error ? err.message : String(err)}`
  }
}

function textResult(text: string) {
  return { content: [{ type: 'text' as const, text }] }
}

function createServer(): McpServer {
  const server = new McpServer({
    name: 'beacon',
    version: '0.1.0',
  })

  // Cast tool registration to avoid zod/MCP deep instantiation issues under tsc
  const tool = server.tool.bind(server) as (
    name: string,
    description: string,
    schema: Record<string, unknown>,
    handler: (args: Record<string, unknown>) => Promise<{ content: { type: 'text'; text: string }[] }>
  ) => void

  tool(
    'check_security',
    'Run BE-1 application security scans plus prompt-injection heuristics. Local-first — never uploads source.',
    PathsSchema,
    async (args) => {
      const paths = args.paths as string[] | undefined
      const files = collectFiles({ roots: resolveRoots(paths), include: isCodeFile })
      const findings = [...scanCode(files), ...scanPromptInjection(files)]
      const syncNote = await maybeSync(findings, 'check_security')
      return textResult(
        `check_security — ${files.length} file(s), ${findings.length} finding(s)\n\n${formatFindings(findings)}${syncNote}`
      )
    }
  )

  tool(
    'scan_dependencies',
    'Scan dependency manifests for slopsquat/typosquat, suspicious install scripts, and insecure http:// sources.',
    PathsSchema,
    async (args) => {
      const paths = args.paths as string[] | undefined
      const files = collectFiles({ roots: resolveRoots(paths), include: isManifestFile })
      const findings = scanDependencies(files)
      const syncNote = await maybeSync(findings, 'scan_dependencies')
      return textResult(
        `scan_dependencies — ${files.length} manifest(s), ${findings.length} finding(s)\n\n${formatFindings(findings)}${syncNote}`
      )
    }
  )

  tool(
    'scan_infra',
    'Scan Terraform, Compose, Dockerfile, nginx/Caddy, and deploy YAML for infra and network posture issues.',
    PathsSchema,
    async (args) => {
      const paths = args.paths as string[] | undefined
      const files = collectFiles({
        roots: resolveRoots(paths),
        include: (p) => isInfraFile(p) || /\.(ya?ml|yml|tf|conf)$/i.test(p),
      })
      const findings = [...scanInfra(files), ...scanNetwork(files)]
      const syncNote = await maybeSync(findings, 'scan_infra')
      return textResult(
        `scan_infra — ${files.length} file(s), ${findings.length} finding(s)\n\n${formatFindings(findings)}${syncNote}`
      )
    }
  )

  tool(
    'pre_deploy_check',
    'Deploy gate: infra + dependency + network + prompt-injection. Returns ok=false on critical/high findings.',
    {
      ...PathsSchema,
      fail_on_high: z
        .boolean()
        .optional()
        .describe('Fail on high severity as well as critical (default true)'),
    },
    async (args) => {
      const paths = args.paths as string[] | undefined
      const failOnHigh = args.fail_on_high !== false
      const files = collectFiles({ roots: resolveRoots(paths) })
      const result = preDeployCheck(files, { failOnHigh })
      const syncNote = await maybeSync(result.findings, 'pre_deploy_check')
      return textResult(
        `pre_deploy_check — ok=${result.ok} critical=${result.criticalCount} high=${result.highCount} total=${result.findings.length}\n\n` +
          formatFindings(result.findings) +
          syncNote
      )
    }
  )

  return server
}

async function main(): Promise<void> {
  const server = createServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Beacon MCP server running on stdio')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
