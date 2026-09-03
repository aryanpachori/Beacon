# Publishing Beacon packages

Packages under `packages/`:

| Package | npm name |
|---------|----------|
| engine | `@forgefastlabs/beacon-engine` |
| mcp | `@forgefastlabs/beacon-mcp` |
| cli | `@forgefastlabs/beacon-cli` |
| extension | `beacon-security` (VS Code Marketplace / Open VSX — not npm) |

## Prerequisites

1. npm org access to `@forgefastlabs` (or change scope in each `package.json`).
2. CI secret `NPM_TOKEN` with publish rights (Automation token recommended).
3. Built `dist/` artifacts (`npm run build:packages`).

## Dry run (local)

```bash
npm install
npm run build:packages
npm run publish:packages -- --dry-run
```

## Publish (manual)

From repo root after build:

```bash
npm run publish:packages
```

This runs `npm publish --access public` in workspace order: engine → mcp → cli.

## Publish (GitHub Actions)

Workflow: `.github/workflows/publish-packages.yml`

- Trigger: `workflow_dispatch` (manual) or push of a tag `packages-v*`
- Requires repository secret: `NPM_TOKEN`

## Version bumps

Keep engine / mcp / cli versions aligned for this monorepo (currently `0.1.0`).
Bump all three together before publish:

```bash
npm version 0.1.1 -w @forgefastlabs/beacon-engine
npm version 0.1.1 -w @forgefastlabs/beacon-mcp
npm version 0.1.1 -w @forgefastlabs/beacon-cli
# also bump dependency ranges if needed
```

## Extension

VS Code / Cursor extension is published separately via `vsce` / Open VSX — see `packages/extension/README.md`.
