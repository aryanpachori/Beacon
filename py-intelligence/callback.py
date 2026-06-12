"""POST scored results to Node /api/internal/score-complete."""

from __future__ import annotations

import logging
from typing import Any

import httpx

from config import API_URL, INTERNAL_WEBHOOK_SECRET

logger = logging.getLogger(__name__)


def post_score_complete(payload: dict[str, Any]) -> None:
    package_id = payload.get("package_id", "<unknown>")
    with httpx.Client(timeout=15.0) as client:
        response = client.post(
            f"{API_URL}/api/internal/score-complete",
            json=payload,
            headers={
                "x-internal-secret": INTERNAL_WEBHOOK_SECRET,
                "Content-Type": "application/json",
            },
        )

    if response.is_success:
        logger.info("event=score_complete_ok package_id=%s status=%d", package_id, response.status_code)
        return

    logger.error(
        "event=score_complete_error package_id=%s status=%d body=%s",
        package_id,
        response.status_code,
        response.text[:500],
    )
    response.raise_for_status()
