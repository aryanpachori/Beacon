# Beacon

Beacon rides along with Cursor, Claude Code and Copilot, reviewing every line the moment it's written — inside your editor, on your machine. Local-first. Zero repo access.

Beacon catches secrets, SQL injection, and broken auth before commit — inline, locally, at the speed AI agents write code.

## Monorepo layout

| Path | What it is |
| --- | --- |
| `frontend/` | Next.js 14 (App Router) marketing site + dashboard — landing page, auth, and the product UI (Overview, Agent Activity, Dependency Tracker, Billing). Tailwind CSS, GSAP/Framer Motion for scroll animation, Recharts for data viz. |
| `backend/` | Bun + Express API — auth, billing (Razorpay), GitHub App integration (Octokit), package/dependency scanning jobs (BullMQ + Redis), Prisma/Postgres. Includes the local-first infra/network/supply-chain scanning engine (`backend/src/engine`). |
| `py-intelligence/` | Python worker that scores packages (XGBoost + heuristic fallback) off the `intelligence-score` BullMQ queue and reports back to the API. |

`frontend/` and `backend/` are deployed independently and each manage their own dependencies — there is no root-level `npm install`.

## Getting started

Install and run each service in its own terminal:

```bash
# Frontend (Next.js) — http://localhost:3000
cd frontend && npm install && npm run dev

# Backend API (Bun)
cd backend && bun install && bun run dev

# Python intelligence worker (optional, scores packages)
cd py-intelligence && python worker.py
```

See `backend/README.md` and `py-intelligence/README.md` for service-specific environment variables and setup.

## Checks

```bash
npm --prefix frontend run check
npm --prefix backend run check
```
