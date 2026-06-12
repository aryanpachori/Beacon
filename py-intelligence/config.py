import os
from pathlib import Path

from dotenv import load_dotenv

_DIR = Path(__file__).resolve().parent
_REPO_ROOT = _DIR.parent

# Shared secrets from backend/.env; py-intelligence/.env overrides locally
load_dotenv(_REPO_ROOT / "backend" / ".env")
load_dotenv(_DIR / ".env", override=True)

REDIS_URL: str = os.environ["REDIS_URL"]
API_URL: str = (
    os.environ.get("API_URL") or os.environ.get("API_PUBLIC_URL") or "http://localhost:4000"
).rstrip("/")
INTERNAL_WEBHOOK_SECRET: str = os.environ["INTERNAL_WEBHOOK_SECRET"]

_raw_model_path = os.environ.get("MODEL_PATH")
if _raw_model_path:
    _model = Path(_raw_model_path).expanduser()
    MODEL_PATH: str | None = str(_model if _model.is_absolute() else _REPO_ROOT / _model)
else:
    MODEL_PATH = None
