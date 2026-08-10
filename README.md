# Beacon

Beacon rides along with Cursor, Claude Code and Copilot, reviewing every line the moment it's written — inside your editor, on your machine. Local-first. Zero repo access.

Beacon catches secrets, SQL injection, and broken auth before commit — inline, locally, at the speed AI agents write code.

## Monorepo layout

| Path | What it is |
| --- | --- |
| `frontend/` | Next.js 14 (App Router) marketing site + dashboard — landing page, auth, and the product UI (Overview, Agent Activity, Dependency Tracker, Billing). Tailwind CSS, GSAP/Framer Motion for scroll animation, Recharts for data viz. |
| `backend/` | Bun + Express API — auth, billing (Razorpay), GitHub App integration (Octokit), package/dependency scanning jobs (BullMQ + Redis), Prisma/Postgres. |
| `engine/` | `@beacon/core` — local-first infra, network, and supply-chain scanning engine for Beacon v2. |
| `py-intelligence/` | Python worker that scores packages (XGBoost + heuristic fallback) off the `intelligence-score` BullMQ queue and reports back to the API. |
| `design_handoff_beacon_landing/` | Design reference/handoff assets for the landing page. |

## Getting started

Install workspace dependencies from the repo root (npm workspaces cover `backend`, `frontend`, `engine`):

```bash
npm install
```

Then run each service in its own terminal:

```bash
# Frontend (Next.js) — http://localhost:3000
npm run dev --prefix frontend

# Backend API (Bun)
cd backend && bun run dev

# Scanning engine
cd engine && bun run check   # type-check; see engine/src for entry points

# Python intelligence worker (optional, scores packages)
cd py-intelligence && python worker.py
```

See `backend/README.md` and `py-intelligence/README.md` for service-specific environment variables and setup.

## Checks

From the repo root:

```bash
npm run check
```

Runs type-checking across `frontend`, `backend`, and `engine`.
