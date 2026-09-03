# Beacon Security (VS Code / Cursor)

Local-first IDE extension for Beacon BE-1 / BE-2 scanners.

## Features

- **Gutter diagnostics** — scans on open/save; Problems panel + inline markers
- **Package health hovers** — hover dependency names in `package.json` for a local health score
- **Fix with Beacon** — quick fixes that apply safe remediations (e.g. `http://` → `https://`, weak TLS cleanup) or insert a suggested-fix comment

## Commands

| Command | ID |
|---------|-----|
| Beacon: Scan Workspace | `beacon.scanWorkspace` |
| Beacon: Scan Current File | `beacon.scanFile` |
| Beacon: Clear Diagnostics | `beacon.clearDiagnostics` |

## Develop

```bash
# from repo root
npm install
npm run build -w @forgefastlabs/beacon-engine
npm run build -w beacon-security

# In VS Code / Cursor: Extensions → Install from VSIX…
# or open packages/extension and press F5 (Run Extension) after adding a launch config.
```

From this monorepo without publishing, point the extension host at `packages/extension` via **Developer: Install Extension from Location…** (Cursor/VS Code) or:

```bash
cd packages/extension && npm run build
# then: code --install-extension .   # or Cursor equivalent
```

## Settings

- `beacon.scanOnSave` (default true)
- `beacon.scanOnOpen` (default true)
- `beacon.syncFindings` (default false) — when true, POST finding metadata if `BEACON_API_URL` + `BEACON_API_TOKEN` are set in the environment
