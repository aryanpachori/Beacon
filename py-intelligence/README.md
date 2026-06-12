# py-intelligence

Separate Python worker for the `intelligence-score` BullMQ queue (XGBoost + heuristic fallback).

The Node API enqueues jobs after signal collection. This process scores packages and POSTs results to `{API_PUBLIC_URL}/api/internal/score-complete`.

## Setup

```bash
cd py-intelligence
cp .env.example .env
# Edit .env — REDIS_URL and INTERNAL_WEBHOOK_SECRET must match backend/.env

python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
python worker.py
```

Config loads `backend/.env` first, then `py-intelligence/.env` overrides.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `REDIS_URL` | Yes | Same Redis as the Node API |
| `API_PUBLIC_URL` | Yes | Node API base URL (e.g. `https://your-api.onrender.com`) |
| `INTERNAL_WEBHOOK_SECRET` | Yes | Must match `backend/.env` exactly |
| `MODEL_PATH` | Yes | `data/driftlogg_model.json` (relative to repo root) |
| `API_URL` | No | Overrides `API_PUBLIC_URL` for callbacks |

## Render (Web Service — free tier)

Do **not** use `gunicorn` — this is a queue worker, not a Django app. `worker.py` serves `GET /health` on `$PORT` for Render.

| Field | Value |
|--------|--------|
| Name | `driftlogg-intelligence` |
| Language | Python 3 |
| Root Directory | *(leave empty)* |
| Build Command | `pip install -r py-intelligence/requirements.txt` |
| Start Command | `python py-intelligence/worker.py` |
| Instance | Free (spins down when idle — scoring pauses until service wakes) |

**Environment variables** (add in Render dashboard):

| Name | Value |
|------|--------|
| `REDIS_URL` | Same as API |
| `API_PUBLIC_URL` | `https://your-api.onrender.com` |
| `INTERNAL_WEBHOOK_SECRET` | Same as API |
| `MODEL_PATH` | `data/driftlogg_model.json` |

Paid **Background Worker** is better for 24/7 queue processing (no HTTP port needed).

## Important

- Do **not** set `ENABLE_NODE_INTELLIGENCE_WORKER=true` on the API while this worker is running.
- Only one consumer should process `intelligence-score` at a time.
