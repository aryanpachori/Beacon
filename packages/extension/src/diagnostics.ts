import * as vscode from 'vscode'
import type { Finding, Severity } from '@forgefastlabs/beacon-engine'

export const BEACON_DIAG_SOURCE = 'beacon'

/** Finding ids keyed by diagnostic message + range for code actions / hovers. */
export const findingByDiagnosticKey = new Map<string, Finding>()

export function diagnosticKey(uri: vscode.Uri, diagnostic: vscode.Diagnostic): string {
  return `${uri.toString()}|${diagnostic.range.start.line}|${diagnostic.range.start.character}|${diagnostic.message}`
}

function severityToVsCode(severity: Severity): vscode.DiagnosticSeverity {
  switch (severity) {
    case 'critical':
    case 'high':
      return vscode.DiagnosticSeverity.Error
    case 'medium':
      return vscode.DiagnosticSeverity.Warning
    default:
      return vscode.DiagnosticSeverity.Information
  }
}

export function findingsToDiagnostics(
  uri: vscode.Uri,
  findings: Finding[],
  collection: vscode.DiagnosticCollection
): void {
  // Clear previous keys for this uri
  for (const key of [...findingByDiagnosticKey.keys()]) {
    if (key.startsWith(`${uri.toString()}|`)) findingByDiagnosticKey.delete(key)
  }

  const diags: vscode.Diagnostic[] = []
  for (const f of findings) {
    const startLine = Math.max(0, (f.line_range?.[0] ?? 1) - 1)
    const endLine = Math.max(startLine, (f.line_range?.[1] ?? startLine + 1) - 1)
    const range = new vscode.Range(startLine, 0, endLine, Number.MAX_SAFE_INTEGER)
    const message = `[${f.severity}] ${f.category}: ${f.description}`
    const diag = new vscode.Diagnostic(range, message, severityToVsCode(f.severity))
    diag.source = BEACON_DIAG_SOURCE
    diag.code = f.category
    diag.relatedInformation = [
      new vscode.DiagnosticRelatedInformation(
        new vscode.Location(uri, range),
        `Fix: ${f.suggested_fix}`
      ),
    ]
    findingByDiagnosticKey.set(diagnosticKey(uri, diag), f)
    diags.push(diag)
  }
  collection.set(uri, diags)
}

export function clearUriDiagnostics(
  uri: vscode.Uri,
  collection: vscode.DiagnosticCollection
): void {
  for (const key of [...findingByDiagnosticKey.keys()]) {
    if (key.startsWith(`${uri.toString()}|`)) findingByDiagnosticKey.delete(key)
  }
  collection.delete(uri)
}
