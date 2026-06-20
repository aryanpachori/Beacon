"""BullMQ consumer for intelligence-score jobs."""

from __future__ import annotations

import asyncio
import logging
import os
import signal
import sys
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any

from bullmq import Worker  # type: ignore

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

QUEUE_NAME = "intelligence-score"


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
    """Render Web Services require a process listening on $PORT."""
    port = int(os.environ.get("PORT", "8080"))
    server = HTTPServer(("0.0.0.0", port), _HealthHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    logger.info("health_server_listening port=%s", port)


async def process_job(job: Any, job_token: str) -> None:  # noqa: ARG001
    data: dict[str, Any] = job.data
    package_id: str = data["package_id"]
    installation_id: str = data["installation_id"]
    prev_sps: int | None = data.get("prev_sps")
    signals: dict[str, float] = data.get("signals", {})
    is_advisory: bool = bool(data.get("is_advisory", False))
    cve_id: str | None = data.get("cve_id")

    logger.info("scoring_started job_id=%s package_id=%s prev_sps=%s is_advisory=%s", job.id, package_id, prev_sps, is_advisory)

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

    logger.info("scoring_complete job_id=%s package_id=%s new_sps=%d tier=%s", job.id, package_id, new_sps, tier)


async def main() -> None:
    _start_health_server()
    initialize_scoring()
    logger.info("intelligence_worker_starting queue=%s redis=%s", QUEUE_NAME, config.REDIS_URL)

    worker = Worker(QUEUE_NAME, process_job, {
        "connection": config.REDIS_URL,
        "concurrency": 1,
        # Stalled check runs every 5 minutes instead of every 30s (default).
        # At concurrency=1 with instant jobs, stalls are irrelevant — this cuts
        # ~2,800 idle Redis commands/day down to ~240.
        "stalledInterval": 300_000,
    })

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

    logger.info("intelligence_worker_ready queue=%s", QUEUE_NAME)
    await stop_event.wait()
    await worker.close()
    logger.info("intelligence_worker_stopped")


if __name__ == "__main__":
    asyncio.run(main())
