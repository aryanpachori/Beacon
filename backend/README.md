# backend

Beacon API + local security engine (`src/engine`).

## Engine (BE-1 / BE-2)

See [`src/engine/README.md`](src/engine/README.md) for `scanCode`, `scanInfra`, `scanDependencies`, `scanNetwork`, `scanPromptInjection`, `preDeployCheck`, and drift monitoring.

## Scripts

```bash
bun install
bun run dev
npm test          # vitest — includes engine scanners
npm run check     # tsc --noEmit
```

