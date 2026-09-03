import * as vscode from 'vscode'
import {
  collectFiles,
  isCodeFile,
  isInfraFile,
  isManifestFile,
  syncFindings,
} from '@forgefastlabs/beacon-engine'
import {
  clearUriDiagnostics,
  findingsToDiagnostics,
} from './diagnostics'
import { BeaconHoverProvider } from './hover'
import { BeaconCodeActionProvider } from './codeActions'
import { scanFilePath } from './scan'

let collection: vscode.DiagnosticCollection

function shouldScanUri(uri: vscode.Uri): boolean {
  if (uri.scheme !== 'file') return false
  const p = uri.fsPath
  return (
    isCodeFile(p) ||
    isManifestFile(p) ||
    isInfraFile(p) ||
    /\.(ya?ml|yml|tf|conf)$/i.test(p) ||
    p.endsWith('package.json')
  )
}

async function maybeSync(
  findings: Parameters<typeof syncFindings>[0]['findings'],
  scanType: string
): Promise<void> {
  const cfg = vscode.workspace.getConfiguration('beacon')
  if (!cfg.get<boolean>('syncFindings')) return
  try {
    await syncFindings({
      findings,
      scanType,
      triggeredBy: 'extension',
    })
  } catch (err) {
    console.error('[beacon] sync failed', err)
  }
}

function scanDocument(doc: vscode.TextDocument): void {
  if (!shouldScanUri(doc.uri)) return
  const findings = scanFilePath(doc.uri.fsPath)
  findingsToDiagnostics(doc.uri, findings, collection)
  void maybeSync(findings, 'extension_file')
}

export function activate(context: vscode.ExtensionContext): void {
  collection = vscode.languages.createDiagnosticCollection('beacon')
  context.subscriptions.push(collection)

  const selector: vscode.DocumentSelector = [
    { scheme: 'file', language: 'typescript' },
    { scheme: 'file', language: 'typescriptreact' },
    { scheme: 'file', language: 'javascript' },
    { scheme: 'file', language: 'javascriptreact' },
    { scheme: 'file', language: 'python' },
    { scheme: 'file', language: 'json' },
    { scheme: 'file', language: 'jsonc' },
    { scheme: 'file', language: 'yaml' },
    { scheme: 'file', language: 'dockerfile' },
    { scheme: 'file', language: 'hcl' },
    { scheme: 'file', pattern: '**/*.{tf,conf,yml,yaml}' },
  ]

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      [{ scheme: 'file', language: 'json' }, { scheme: 'file', pattern: '**/package.json' }],
      new BeaconHoverProvider()
    )
  )

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(selector, new BeaconCodeActionProvider(), {
      providedCodeActionKinds: BeaconCodeActionProvider.providedCodeActionKinds,
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('beacon.copySuggestedFix', async (text: string) => {
      await vscode.env.clipboard.writeText(text)
      vscode.window.showInformationMessage('Beacon suggested fix copied to clipboard.')
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('beacon.clearDiagnostics', () => {
      collection.clear()
      vscode.window.showInformationMessage('Beacon diagnostics cleared.')
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('beacon.scanFile', () => {
      const editor = vscode.window.activeTextEditor
      if (!editor) {
        vscode.window.showWarningMessage('No active file to scan.')
        return
      }
      scanDocument(editor.document)
      const count = collection.get(editor.document.uri)?.length ?? 0
      vscode.window.showInformationMessage(`Beacon: ${count} finding(s) in current file.`)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('beacon.scanWorkspace', async () => {
      const folders = vscode.workspace.workspaceFolders
      if (!folders?.length) {
        vscode.window.showWarningMessage('Open a folder to scan the workspace.')
        return
      }
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Beacon: scanning workspace…',
        },
        async () => {
          const roots = folders.map((f) => f.uri.fsPath)
          const files = collectFiles({
            roots,
            maxFiles: 1500,
            include: (p) =>
              isCodeFile(p) ||
              isManifestFile(p) ||
              isInfraFile(p) ||
              /\.(ya?ml|yml|tf|conf)$/i.test(p),
          })
          collection.clear()
          const byFile = new Map<string, ReturnType<typeof scanFilePath>>()
          for (const file of files) {
            const findings = scanFilePath(file)
            if (findings.length) byFile.set(file, findings)
          }
          let total = 0
          for (const [file, findings] of byFile) {
            total += findings.length
            findingsToDiagnostics(vscode.Uri.file(file), findings, collection)
          }
          const all = [...byFile.values()].flat()
          await maybeSync(all, 'extension_workspace')
          vscode.window.showInformationMessage(
            `Beacon: scanned ${files.length} file(s), ${total} finding(s).`
          )
        }
      )
    })
  )

  const cfg = () => vscode.workspace.getConfiguration('beacon')

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (cfg().get<boolean>('scanOnSave')) scanDocument(doc)
    })
  )

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => {
      if (cfg().get<boolean>('scanOnOpen')) scanDocument(doc)
    })
  )

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) => {
      clearUriDiagnostics(doc.uri, collection)
    })
  )

  // Initial pass on already-open editors
  for (const doc of vscode.workspace.textDocuments) {
    if (cfg().get<boolean>('scanOnOpen')) scanDocument(doc)
  }
}

export function deactivate(): void {
  collection?.dispose()
}
