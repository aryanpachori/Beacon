# Beacon agent rules

Use Beacon security tools before shipping code changes. Prefer calling these MCP tools over guessing:

- `check_security` — application code (secrets, injection, auth, SSRF, prompt injection)
- `scan_dependencies` — manifests (slopsquat, install scripts, http sources)
- `scan_infra` — Terraform / Compose / Dockerfile / nginx / deploy YAML
- `pre_deploy_check` — full deploy gate; treat `ok=false` as a blocker for apply/merge

## When to call

1. Before committing or opening a PR that touches app code → `check_security` on changed paths.
2. When adding or changing dependencies → `scan_dependencies`.
3. When editing infra / network / deploy configs → `scan_infra`.
4. Before terraform apply, production deploy, or merge to main → `pre_deploy_check`.

## Rules

- Run scans locally via Beacon tools; do not upload source to third parties for this check.
- Summarize findings to the user with severity and suggested fixes.
- Fix critical/high issues before declaring the task done when `pre_deploy_check` fails.
- Optional dashboard sync uses `BEACON_API_URL` + `BEACON_API_TOKEN` (findings metadata only).
