"""Direct Redis BRPOP consumer for intelligence-score jobs.

Replaces the BullMQ Python worker to eliminate idle polling overhead on Upstash.
Uses a single BRPOP with 30s timeout — 2 Redis commands/minute when idle instead
of hundreds from BullMQ's 1ms block timeout + stalled-check loop.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import signal
import sys
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any

import redis.asyncio as aioredis

import config
from callback import post_score_complete
from scorer import assign_tier, initialize_scoring, score

logging.basicConfig(
    level=logging.INFO,
    format='{"time":"%(asctime)s","level":"%(levelname)s","event":"%(message)s"}',
    datefmt="%Y-%m-%dT%H:%M:%SZ",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)

QUEUE_KEY = "beacon:intel:queue"
BRPOP_TIMEOUT = 30  # seconds — 2 Redis commands/minute when idle


class _HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        if self.path in ("/", "/health"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
            return
        self.send_response(404)
        self.end_headers()

    def log_message(self, format: str, *args: object) -> None:
        return


def _start_health_server() -> None:
    port = int(os.environ.get("PORT", "8080"))
    server = HTTPServer(("0.0.0.0", port), _HealthHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    logger.info("health_server_listening port=%s", port)


async def process_job(job_id: str, data: dict[str, Any]) -> None:
    package_id: str = data["package_id"]
    installation_id: str = data["installation_id"]
    prev_sps: int | None = data.get("prev_sps")
    signals: dict[str, float] = data.get("signals", {})
    is_advisory: bool = bool(data.get("is_advisory", False))
    cve_id: str | None = data.get("cve_id")

    logger.info("scoring_started job_id=%s package_id=%s prev_sps=%s is_advisory=%s", job_id, package_id, prev_sps, is_advisory)

    new_sps, tier, prediction_reason = score(signals)
    prev_tier = assign_tier(prev_sps) if prev_sps is not None else None

    payload: dict[str, Any] = {
        "package_id": package_id,
        "installation_id": installation_id,
        "new_sps": new_sps,
        "tier": tier,
        "prev_sps": prev_sps,
        "prev_tier": prev_tier,
        "prediction_reason": prediction_reason,
        "signals": signals,
    }
    if is_advisory:
        payload["is_advisory"] = True
    if cve_id:
        payload["cve_id"] = cve_id

    await asyncio.to_thread(post_score_complete, payload)

    logger.info("scoring_complete job_id=%s package_id=%s new_sps=%d tier=%s", job_id, package_id, new_sps, tier)


async def consume_loop(client: aioredis.Redis, stop_event: asyncio.Event) -> None:
    logger.info("consumer_ready queue=%s brpop_timeout=%ss", QUEUE_KEY, BRPOP_TIMEOUT)
    while not stop_event.is_set():
        try:
            result = await client.brpop(QUEUE_KEY, timeout=BRPOP_TIMEOUT)
            if result is None:
                # Timeout — no job available, loop back
                continue
            _, raw = result
            envelope = json.loads(raw)
            job_id: str = envelope.get("id", "unknown")
            data: dict[str, Any] = envelope.get("data", {})
            await process_job(job_id, data)
        except asyncio.CancelledError:
            break
        except Exception as err:
            logger.error("job_failed error=%s", err)
            await asyncio.sleep(1)


async def main() -> None:
    _start_health_server()
    initialize_scoring()
    logger.info("intelligence_worker_starting queue=%s redis=%s", QUEUE_KEY, config.REDIS_URL)

    # Single connection — one BRPOP/30s when idle
    client = aioredis.from_url(config.REDIS_URL, decode_responses=True)

    stop_event = asyncio.Event()
    loop = asyncio.get_running_loop()

    def request_stop(*_args: object) -> None:
        loop.call_soon_threadsafe(stop_event.set)

    if sys.platform == "win32":
        signal.signal(signal.SIGINT, request_stop)
        signal.signal(signal.SIGTERM, request_stop)
    else:
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(sig, stop_event.set)

    await consume_loop(client, stop_event)
    await client.aclose()
    logger.info("intelligence_worker_stopped")


if __name__ == "__main__":
    asyncio.run(main())
