"""BullMQ consumer for intelligence-score jobs."""

from __future__ import annotations

import asyncio
import logging
import signal
import sys
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


async def process_job(job: Any, job_token: str) -> None:  # noqa: ARG001
    data: dict[str, Any] = job.data
    package_id: str = data["package_id"]
    installation_id: str = data["installation_id"]
    prev_sps: int | None = data.get("prev_sps")
    signals: dict[str, float] = data.get("signals", {})

    logger.info("scoring_started job_id=%s package_id=%s prev_sps=%s", job.id, package_id, prev_sps)

    new_sps, tier, prediction_reason = score(signals)
    prev_tier = assign_tier(prev_sps) if prev_sps is not None else None

    await asyncio.to_thread(
        post_score_complete,
        {
            "package_id": package_id,
            "installation_id": installation_id,
            "new_sps": new_sps,
            "tier": tier,
            "prev_sps": prev_sps,
            "prev_tier": prev_tier,
            "prediction_reason": prediction_reason,
            "signals": signals,
        },
    )

    logger.info("scoring_complete job_id=%s package_id=%s new_sps=%d tier=%s", job.id, package_id, new_sps, tier)


async def main() -> None:
    initialize_scoring()
    logger.info("intelligence_worker_starting queue=%s redis=%s", QUEUE_NAME, config.REDIS_URL)

    worker = Worker(QUEUE_NAME, process_job, {"connection": config.REDIS_URL, "concurrency": 5})

    loop = asyncio.get_running_loop()
    stop_event = asyncio.Event()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, stop_event.set)

    logger.info("intelligence_worker_ready queue=%s", QUEUE_NAME)
    await stop_event.wait()
    await worker.close()
    logger.info("intelligence_worker_stopped")


if __name__ == "__main__":
    asyncio.run(main())
