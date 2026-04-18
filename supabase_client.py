"""
Supabase job log for carousel-bot.

Design goals:
  - Pure audit/history layer on top of the existing in-memory flow.
  - Graceful no-op when SUPABASE_URL / SUPABASE_KEY are unset, so local
    runs and first-time Railway deploys keep working with zero config.
  - All DB calls go through asyncio.to_thread so we never block the
    event loop (supabase-py v2 is sync under the hood).
"""

from __future__ import annotations

import asyncio
import logging
import os
from datetime import datetime, timezone
from typing import Any, Optional

logger = logging.getLogger(__name__)

try:
    from supabase import create_client, Client
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False
    Client = object  # type: ignore


TABLE = "carousel_jobs"


class SupabaseLog:
    """Thin wrapper around the carousel_jobs table."""

    def __init__(self, url: str = "", key: str = ""):
        self.url = url or os.environ.get("SUPABASE_URL", "")
        self.key = key or os.environ.get("SUPABASE_KEY", "")
        self._client: Optional[Client] = None

        if not HAS_SUPABASE:
            logger.warning("⚠️  supabase package not installed — job log disabled")
            return
        if not (self.url and self.key):
            logger.info("ℹ️  SUPABASE_URL/KEY not set — job log disabled (graceful no-op)")
            return

        try:
            self._client = create_client(self.url, self.key)
            logger.info("✅ Supabase job log enabled")
        except Exception as exc:
            logger.error(f"❌ Supabase init failed, disabling job log: {exc}")
            self._client = None

    @property
    def enabled(self) -> bool:
        return self._client is not None

    # ─── Writes ─────────────────────────────────────────────────

    async def create_job(
        self,
        user_id: str,
        username: Optional[str],
        chat_id: Optional[str],
        brief: str,
        style: str = "cinematico",
    ) -> Optional[str]:
        """Insert a new job row. Returns the UUID (string) or None."""
        if not self.enabled:
            return None

        payload = {
            "user_id": str(user_id),
            "username": username,
            "chat_id": str(chat_id) if chat_id is not None else None,
            "brief": brief,
            "style": style,
            "status": "researching",
        }
        try:
            result = await asyncio.to_thread(
                lambda: self._client.table(TABLE).insert(payload).execute()
            )
            if result.data:
                job_id = result.data[0]["id"]
                logger.info(f"📝 job {job_id[:8]} created — user={user_id}")
                return job_id
        except Exception as exc:
            logger.error(f"❌ create_job failed: {exc}")
        return None

    async def update_job(self, job_id: Optional[str], **fields: Any) -> None:
        """Patch a job row. Silently skips if job_id is None or log is disabled."""
        if not self.enabled or not job_id or not fields:
            return

        # Auto-stamp posted_at when transitioning to 'posted'
        if fields.get("status") == "posted" and "posted_at" not in fields:
            fields["posted_at"] = datetime.now(timezone.utc).isoformat()

        try:
            await asyncio.to_thread(
                lambda: self._client.table(TABLE).update(fields).eq("id", job_id).execute()
            )
            status = fields.get("status", "patch")
            logger.info(f"📝 job {job_id[:8]} → {status}")
        except Exception as exc:
            logger.error(f"❌ update_job({job_id[:8]}) failed: {exc}")

    async def mark_failed(self, job_id: Optional[str], error: str) -> None:
        """Convenience wrapper for terminal failure."""
        await self.update_job(job_id, status="failed", error_message=error[:1000])

    # ─── Reads ──────────────────────────────────────────────────

    async def get_history(self, user_id: str, limit: int = 10) -> list[dict]:
        """Return the user's most recent jobs (newest first)."""
        if not self.enabled:
            return []
        try:
            result = await asyncio.to_thread(
                lambda: self._client.table(TABLE)
                .select("id, brief, status, created_at, posted_at, instagram_permalink, error_message")
                .eq("user_id", str(user_id))
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            return result.data or []
        except Exception as exc:
            logger.error(f"❌ get_history failed: {exc}")
            return []
