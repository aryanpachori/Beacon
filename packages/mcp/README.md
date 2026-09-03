# @forgefastlabs/beacon-mcp

Local-first MCP server exposing Beacon BE-1 / BE-2 scanners:

| Tool | Engine |
|------|--------|
| `check_security` | `scanCode` + `scanPromptInjection` |
| `scan_dependencies` | `scanDependencies` |
| `scan_infra` | `scanInfra` + `scanNetwork` |
| `pre_deploy_check` | `preDeployCheck` |

Never uploads source. Optional finding sync via `BEACON_API_URL` + `BEACON_API_TOKEN`.

## Cursor (stdio)

Add to MCP config:

```json
{
  "mcpServers": {
    "beacon": {
      "command": "npx",
      "args": ["-y", "@forgefastlabs/beacon-mcp"]
    }
  }
}
```

From this monorepo (before publish):

```json
{
  "mcpServers": {
    "beacon": {
      "command": "node",
      "args": ["packages/mcp/dist/index.js"]
    }
  }
}
```

## Agent rules

Copy [`templates/beacon.mdc`](./templates/beacon.mdc) to `.cursor/rules/`, or run:

```bash
npx @forgefastlabs/beacon-cli init
```
