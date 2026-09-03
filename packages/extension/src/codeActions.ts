import * as vscode from 'vscode'
import {
  BEACON_DIAG_SOURCE,
  diagnosticKey,
  findingByDiagnosticKey,
} from './diagnostics'
import type { Finding } from '@forgefastlabs/beacon-engine'

function applyHttpToHttps(document: vscode.TextDocument, line: number): vscode.WorkspaceEdit | null {
  const text = document.lineAt(line).text
  if (!/http:\/\//i.test(text)) return null
  const edit = new vscode.WorkspaceEdit()
  const range = document.lineAt(line).range
  edit.replace(document.uri, range, text.replace(/http:\/\//gi, 'https://'))
  return edit
}

function applyWeakTlsCleanup(document: vscode.TextDocument, line: number): vscode.WorkspaceEdit | null {
  const text = document.lineAt(line).text
  if (!/TLSv1(\.1)?/i.test(text) && !/tls_version\s*=\s*"?1\.[01]"?/i.test(text)) return null
  let next = text
    .replace(/\bTLSv1\.1\b/gi, '')
    .replace(/\bTLSv1\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s;/, ';')
  if (!/TLSv1\.2|TLSv1\.3|1\.2|1\.3/i.test(next)) {
    // Ensure a modern protocol remains in nginx-style ssl_protocols lines
    if (/ssl_protocols/i.test(next)) {
      next = next.replace(/ssl_protocols\s+/i, 'ssl_protocols TLSv1.2 TLSv1.3 ')
    }
  }
  if (next === text) return null
  const edit = new vscode.WorkspaceEdit()
  edit.replace(document.uri, document.lineAt(line).range, next)
  return edit
}

function applyCommentGuidance(
  document: vscode.TextDocument,
  line: number,
  finding: Finding
): vscode.WorkspaceEdit {
  const edit = new vscode.WorkspaceEdit()
  const indent = document.lineAt(line).text.match(/^\s*/)?.[0] ?? ''
  const comment =
    document.languageId === 'python'
      ? `${indent}# BEACON: ${finding.suggested_fix}\n`
      : document.languageId === 'yaml' || document.fileName.endsWith('.yml')
        ? `${indent}# BEACON: ${finding.suggested_fix}\n`
        : `${indent}// BEACON: ${finding.suggested_fix}\n`
  edit.insert(document.uri, new vscode.Position(line, 0), comment)
  return edit
}

function tryAutoEdit(document: vscode.TextDocument, finding: Finding): vscode.WorkspaceEdit | null {
  const line = Math.max(0, (finding.line_range?.[0] ?? 1) - 1)
  if (finding.category === 'insecure_dependency_source') {
    return applyHttpToHttps(document, line)
  }
  if (finding.category === 'weak_tls') {
    return applyWeakTlsCleanup(document, line)
  }
  return null
}

export class BeaconCodeActionProvider implements vscode.CodeActionProvider {
  static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix]

  provideCodeActions(
    document: vscode.TextDocument,
    _range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = []

    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source !== BEACON_DIAG_SOURCE) continue
      const finding =
        findingByDiagnosticKey.get(diagnosticKey(document.uri, diagnostic)) ??
        null
      if (!finding) continue

      const autoEdit = tryAutoEdit(document, finding)
      if (autoEdit) {
        const fix = new vscode.CodeAction(
          `Fix with Beacon: apply ${finding.category} remediation`,
          vscode.CodeActionKind.QuickFix
        )
        fix.diagnostics = [diagnostic]
        fix.isPreferred = true
        fix.edit = autoEdit
        actions.push(fix)
      }

      const guide = new vscode.CodeAction(
        'Fix with Beacon: insert suggested fix comment',
        vscode.CodeActionKind.QuickFix
      )
      guide.diagnostics = [diagnostic]
      guide.edit = applyCommentGuidance(
        document,
        Math.max(0, (finding.line_range?.[0] ?? 1) - 1),
        finding
      )
      actions.push(guide)

      const copy = new vscode.CodeAction(
        'Beacon: copy suggested fix',
        vscode.CodeActionKind.QuickFix
      )
      copy.diagnostics = [diagnostic]
      copy.command = {
        command: 'beacon.copySuggestedFix',
        title: 'Copy suggested fix',
        arguments: [finding.suggested_fix],
      }
      actions.push(copy)
    }

    return actions
  }
}
