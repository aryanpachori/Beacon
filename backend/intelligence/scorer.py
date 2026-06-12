"""SPS inference: XGBoost when MODEL_PATH is set, weighted heuristic as fallback."""

from __future__ import annotations

import logging
from typing import Any

import config

logger = logging.getLogger(__name__)

FEATURE_ORDER = [
    "commit_velocity",
    "maintainer_activity",
    "security_hygiene",
    "issue_resolution",
    "funding",
    "community_health",
]

_HEURISTIC_WEIGHTS = {
    "commit_velocity": 0.20,
    "maintainer_activity": 0.22,
    "security_hygiene": 0.22,
    "issue_resolution": 0.16,
    "funding": 0.08,
    "community_health": 0.12,
}

_SIGNAL_LABELS = {
    "commit_velocity": "Commit velocity",
    "maintainer_activity": "Maintainer activity",
    "security_hygiene": "Security hygiene",
    "issue_resolution": "Issue resolution",
    "funding": "Funding",
    "community_health": "Community health",
}

# security_hygiene <= 15 means npm deprecated (set during signal collection)
_DEPRECATED_SECURITY_THRESHOLD = 15
_DEPRECATED_SPS_CAP = 30

_xgb_model: Any | None = None
_xgb_available = False


def assign_tier(sps: int) -> str:
    if sps < 20:
        return "critical"
    if sps < 50:
        return "at-risk"
    if sps < 80:
        return "watch"
    return "healthy"


def initialize_scoring() -> None:
    global _xgb_model, _xgb_available

    model_path = config.MODEL_PATH
    if not model_path:
        return

    try:
        from xgboost import XGBClassifier  # type: ignore

        model = XGBClassifier()
        model.load_model(model_path)
        _xgb_model = model
        _xgb_available = True
        logger.info("event=xgb_model_loaded path=%s", model_path)
    except Exception as exc:
        _xgb_model = None
        _xgb_available = False
        logger.warning("event=xgb_model_load_failed path=%s error=%s", model_path, exc)


def _feature_vector(signals: dict[str, float]) -> list[float]:
    return [float(signals.get(key, 0.0)) for key in FEATURE_ORDER]


def _is_deprecated(signals: dict[str, float]) -> bool:
    return signals.get("security_hygiene", 100) <= _DEPRECATED_SECURITY_THRESHOLD


def _apply_deprecated_cap(sps: int, signals: dict[str, float]) -> int:
    if _is_deprecated(signals):
        return min(sps, _DEPRECATED_SPS_CAP)
    return sps


def _score(signals: dict[str, float]) -> tuple[int, float, str]:
    vector = _feature_vector(signals)

    if _xgb_available and _xgb_model is not None:
        try:
            import numpy as np  # type: ignore

            p_abandoned = float(_xgb_model.predict_proba(np.array([vector]))[0][1])
            sps = round((1.0 - p_abandoned) * 100)
            return _apply_deprecated_cap(sps, signals), p_abandoned, "xgboost"
        except Exception as exc:
            logger.warning("event=xgb_inference_failed error=%s", exc)

    health = sum(_HEURISTIC_WEIGHTS[k] * v for k, v in zip(FEATURE_ORDER, vector, strict=True)) / 100.0
    p_abandoned = 1.0 - health
    sps = _apply_deprecated_cap(round(health * 100), signals)
    return sps, p_abandoned, "heuristic"


def _generate_reason(signals: dict[str, float]) -> str:
    if not signals:
        return "Insufficient signal data to generate a prediction."

    if _is_deprecated(signals):
        return (
            "Package is deprecated on the npm registry — the maintainer has marked it "
            "as no longer supported."
        )

    weakest_key = min(FEATURE_ORDER, key=lambda k: signals.get(k, 0.0))
    weakest_value = signals.get(weakest_key, 0.0)
    label = _SIGNAL_LABELS[weakest_key]
    severity = (
        "critically low" if weakest_value < 20 else "low" if weakest_value < 50 else "below average"
    )
    return (
        f"{label} scored {weakest_value:.0f}/100 ({severity}), "
        f"making it the primary risk driver for this package."
    )


def score(signals: dict[str, float]) -> tuple[int, str, str]:
    sps, p_abandoned, method = _score(signals)
    logger.info(
        "event=package_scored method=%s sps=%d probability_abandoned=%.4f deprecated=%s",
        method,
        sps,
        p_abandoned,
        _is_deprecated(signals),
    )
    return sps, assign_tier(sps), _generate_reason(signals)
