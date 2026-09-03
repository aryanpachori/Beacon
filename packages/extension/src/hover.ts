import * as vscode from 'vscode'
import { scanFilePath } from './scan'
import type { Finding } from '@forgefastlabs/beacon-engine'

const POPULAR_HINT = new Set([
  'react',
  'react-dom',
  'next',
  'express',
  'lodash',
  'axios',
  'typescript',
  'vite',
  'eslint',
  'prettier',
  'jest',
  'vitest',
  'zod',
  'prisma',
  'dotenv',
])

function scoreForPackage(name: string, findings: Finding[]): {
  score: number
  label: string
  notes: string[]
} {
  const related = findings.filter(
    (f) =>
      f.description.toLowerCase().includes(`"${name.toLowerCase()}"`) ||
      f.description.toLowerCase().includes(name.toLowerCase())
  )
  let score = POPULAR_HINT.has(name.toLowerCase()) ? 92 : 78
  const notes: string[] = []

  for (const f of related) {
    if (f.category === 'slopsquat') {
      score = Math.min(score, 25)
      notes.push(`Possible typosquat: ${f.description}`)
    } else if (f.category === 'insecure_dependency_source') {
      score = Math.min(score, 40)
      notes.push(f.description)
    } else if (f.category === 'suspicious_install_script') {
      score = Math.min(score, 15)
      notes.push(f.description)
    } else {
      score = Math.min(score, 55)
      notes.push(f.description)
    }
  }

  if (notes.length === 0 && POPULAR_HINT.has(name.toLowerCase())) {
    notes.push('Known popular package — no Beacon supply-chain findings on this name.')
  } else if (notes.length === 0) {
    notes.push('No Beacon findings for this dependency in the current file.')
  }

  let label = 'Fair'
  if (score >= 85) label = 'Healthy'
  else if (score >= 70) label = 'OK'
  else if (score >= 40) label = 'Caution'
  else label = 'At risk'

  return { score, label, notes }
}

function dependencyNameAtPosition(
  document: vscode.TextDocument,
  position: vscode.Position
): string | null {
  if (!document.fileName.endsWith('package.json')) return null
  const line = document.lineAt(position.line).text
  const match = line.match(/^\s*"([^"]+)"\s*:\s*"/)
  if (!match) return null
  const name = match[1]!
  // Only treat as dep if inside dependencies / devDependencies blocks (heuristic: not scripts/name/version)
  if (['name', 'version', 'description', 'main', 'license', 'private'].includes(name)) return null
  const nameStart = line.indexOf(`"${name}"`)
  const nameEnd = nameStart + name.length + 2
  if (position.character < nameStart || position.character > nameEnd) return null

  // Confirm we're under a dependency section
  const text = document.getText()
  const offset = document.offsetAt(new vscode.Position(position.line, 0))
  const before = text.slice(0, offset)
  const lastDeps = Math.max(
    before.lastIndexOf('"dependencies"'),
    before.lastIndexOf('"devDependencies"'),
    before.lastIndexOf('"optionalDependencies"'),
    before.lastIndexOf('"peerDependencies"')
  )
  const lastScripts = before.lastIndexOf('"scripts"')
  if (lastDeps < 0 || lastDeps < lastScripts) return null
  return name
}

export class BeaconHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.Hover> {
    const name = dependencyNameAtPosition(document, position)
    if (!name) return null

    const findings = scanFilePath(document.uri.fsPath)
    const { score, label, notes } = scoreForPackage(name, findings)

    const md = new vscode.MarkdownString(undefined, true)
    md.isTrusted = false
    md.appendMarkdown(`### Beacon · \`${name}\`\n\n`)
    md.appendMarkdown(`**Health score:** ${score}/100 · **${label}**\n\n`)
    for (const n of notes.slice(0, 4)) {
      md.appendMarkdown(`- ${n}\n`)
    }
    md.appendMarkdown(`\n_Local heuristic from Beacon scanners — not a live registry reputation check._`)

    const line = document.lineAt(position.line)
    return new vscode.Hover(md, line.range)
  }
}
