# Beacon security engine

Local-first scanners that emit a shared [`Finding`](./finding.ts) schema for MCP / CLI / extension / dashboard sync.

## BE-1 (application code)

| Function | Module | Notes |
|----------|--------|--------|
| `scanCode(filePaths)` | [`scanCode.ts`](./scanCode.ts) | Secrets, injection, auth, SSRF, etc. |

## BE-2 (infra, network & supply-chain)

| Function | Module | Notes |
|----------|--------|--------|
| `scanInfra(filePaths)` | [`scanInfra.ts`](./scanInfra.ts) | Terraform, Compose, Dockerfile, nginx/Caddy |
| `scanDependencies(filePaths)` | [`scanDependencies.ts`](./scanDependencies.ts) | Slopsquat, install scripts, http:// sources |
| `scanNetwork(filePaths)` | [`scanNetwork.ts`](./scanNetwork.ts) | Weak TLS, mTLS, default net creds, WAF/DNSSEC heuristics |
| `scanPromptInjection(filePaths)` | [`scanPromptInjection.ts`](./scanPromptInjection.ts) | Untrusted input → LLM prompts |
| `preDeployCheck(filePaths)` | [`preDeployCheck.ts`](./preDeployCheck.ts) | Aggregates scanners; `ok` false on critical/high |
| `detectInfraDrift(paths, baseline)` | [`driftMonitor.ts`](./driftMonitor.ts) | New/worsened findings vs last-known-good |

### Drift cron

[`../cron/infraDrift.cron.ts`](../cron/infraDrift.cron.ts) runs daily when configured:

- `BEACON_INFRA_BASELINE` — JSON file of baseline `Finding[]`
- `BEACON_INFRA_SCAN_PATHS` — comma-separated paths to re-scan
- `BEACON_INFRA_DRIFT_UPDATE=1` — rewrite baseline after each run

### Tests

```bash
cd backend && npm test
```
