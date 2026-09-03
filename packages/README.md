# Beacon packages (FE/Ext)

Local-first delivery surface for BE-1 / BE-2 engines.

| Package | npm name | Role |
|---------|----------|------|
| [`engine`](./engine) | `@forgefastlabs/beacon-engine` | Shared scanners + file collect + optional dashboard sync |
| [`mcp`](./mcp) | `@forgefastlabs/beacon-mcp` | MCP tools: `check_security`, `scan_dependencies`, `scan_infra`, `pre_deploy_check` |
| [`cli`](./cli) | `@forgefastlabs/beacon-cli` | `beacon scan`, `beacon init`, `beacon pre-commit` |
| [`extension`](./extension) | `beacon-security` (VS Code) | Gutter diagnostics, package health hovers, Fix with Beacon |

See [`PUBLISH.md`](./PUBLISH.md) for npm publish steps and CI.

## Quick start

```bash
# from repo root
npm install
npm run build:packages

# CLI
node packages/cli/dist/index.js scan --type dependencies --path .
node packages/cli/dist/index.js init --hooks

# MCP (stdio — wire in Cursor / Claude / Windsurf)
node packages/mcp/dist/index.js
# or: npx -y @forgefastlabs/beacon-mcp   (after publish)
```

## Agent rules

`beacon init` writes `.cursor/rules/beacon.mdc`. Templates also live in:

- `packages/mcp/templates/`
- `templates/` (repo root)

## Optional dashboard sync

Set `BEACON_API_URL` + `BEACON_API_TOKEN` and pass `--sync` (CLI) or call MCP tools — only finding metadata is POSTed to `/api/agent-activity/scans`.
