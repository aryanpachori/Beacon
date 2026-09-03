# @forgefastlabs/beacon-cli

```bash
npx @forgefastlabs/beacon-cli init [--hooks]
npx @forgefastlabs/beacon-cli scan [--type security|dependencies|infra|all|predeploy] [--path .] [--json] [--sync] [--fail-on high|critical]
npx @forgefastlabs/beacon-cli pre-commit
```

Local-first — scanning stays on your machine. `--sync` only sends finding metadata when `BEACON_API_URL` and `BEACON_API_TOKEN` are set.
