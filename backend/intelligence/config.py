import os
from pathlib import Path

from dotenv import load_dotenv

# Load backend/.env (handles multiline PEM keys — don't use shell export)
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

REDIS_URL: str = os.environ["REDIS_URL"]
API_URL: str = os.environ["API_URL"].rstrip("/")
INTERNAL_WEBHOOK_SECRET: str = os.environ["INTERNAL_WEBHOOK_SECRET"]
MODEL_PATH: str | None = os.environ.get("MODEL_PATH")
