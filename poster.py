"""
Poster — postforme.dev API client for Instagram carousel posting.

3-step upload flow:
  1. POST /v1/media/create-upload-url  → get signed URL + media reference
  2. PUT  <signed_url>                 → upload raw image bytes
  3. POST /social-posts                → publish carousel to Instagram
"""

import os
import json
import logging
from typing import List, Optional, Dict

logger = logging.getLogger(__name__)

try:
    import aiohttp
    HAS_AIOHTTP = True
except ImportError:
    HAS_AIOHTTP = False
    import urllib.request
    import urllib.error

POSTFORME_BASE = "https://api.postforme.dev"


class PostformeClient:
    """Post carousels to Instagram via postforme.dev API."""

    def __init__(self, api_key: str = "", ig_id: str = ""):
        self.api_key = api_key or os.environ.get("POSTFORME_API_KEY", "")
        self.ig_id = str(ig_id or os.environ.get("POSTFORME_IG_ID", ""))

    # ─── Public entry point ──────────────────────────────────────

    async def post_carousel(self, image_paths: List[str], caption: str) -> Optional[Dict]:
        """Upload images and publish a carousel to Instagram."""

        if not self.api_key:
            logger.error("❌ Missing POSTFORME_API_KEY")
            return None
        if not self.ig_id:
            logger.error("❌ Missing POSTFORME_IG_ID")
            return None

        auth_headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        logger.info(f"🚀 Starting carousel upload: {len(image_paths)} images, ig_id={self.ig_id}")

        if HAS_AIOHTTP:
            return await self._post_carousel_aiohttp(image_paths, caption, auth_headers)
        else:
            import asyncio
            return await asyncio.to_thread(
                self._post_carousel_sync, image_paths, caption, auth_headers
            )

    # ─── aiohttp path ────────────────────────────────────────────

    async def _post_carousel_aiohttp(
        self, image_paths: List[str], caption: str, auth_headers: Dict
    ) -> Optional[Dict]:
        async with aiohttp.ClientSession() as session:
            media: List[Dict] = []

            for i, img_path in enumerate(image_paths):
                label = f"image {i + 1}/{len(image_paths)}"

                # ── Step 1: get signed upload URL ──────────────
                logger.info(f"📤 [{label}] Step 1 — requesting upload URL…")
                upload_info = await self._create_upload_url_aiohttp(
                    session, auth_headers, img_path
                )
                if not upload_info:
                    logger.error(f"❌ [{label}] Failed to obtain upload URL — aborting")
                    return None

                logger.info(f"📋 [{label}] upload_info keys: {list(upload_info.keys())}")

                upload_url = (
                    upload_info.get("upload_url")
                    or upload_info.get("uploadUrl")
                    or upload_info.get("signedUrl")
                )
                media_url = (
                    upload_info.get("url")
                    or upload_info.get("media_url")
                    or upload_info.get("mediaUrl")
                    or upload_info.get("fileUrl")
                )
                media_id = (
                    upload_info.get("id")
                    or upload_info.get("media_id")
                    or upload_info.get("mediaId")
                )

                if not upload_url:
                    logger.error(
                        f"❌ [{label}] No upload_url in response: "
                        f"{json.dumps(upload_info, ensure_ascii=False)[:300]}"
                    )
                    return None

                # ── Step 2: upload bytes to signed URL ─────────
                logger.info(f"⬆️  [{label}] Step 2 — uploading to signed URL…")
                ok = await self._upload_to_signed_url_aiohttp(session, upload_url, img_path)
                if not ok:
                    logger.error(f"❌ [{label}] Signed-URL upload failed — aborting")
                    return None

                # build media entry
                entry: Dict = {"type": "image"}
                if media_id:
                    entry["id"] = media_id
                if media_url:
                    entry["url"] = media_url
                media.append(entry)
                logger.info(f"✅ [{label}] Uploaded — media entry: {entry}")

            # ── Step 3: create the social post ─────────────────
            body: Dict = {
                "social_accounts": [self.ig_id],
                "media": media,
                "caption": caption,
            }
            logger.info(
                f"📨 Step 3 — POST /social-posts body (truncated): "
                f"{json.dumps(body, ensure_ascii=False)[:600]}"
            )

            async with session.post(
                f"{POSTFORME_BASE}/social-posts",
                json=body,
                headers=auth_headers,
                timeout=aiohttp.ClientTimeout(total=120),
            ) as resp:
                resp_text = await resp.text()
                logger.info(
                    f"📬 POST /social-posts → HTTP {resp.status} | {resp_text[:400]}"
                )

                if resp.status in (200, 201):
                    try:
                        return json.loads(resp_text)
                    except Exception:
                        return {"status": "ok", "raw": resp_text}
                else:
                    logger.error(
                        f"❌ POST /social-posts failed: HTTP {resp.status} — {resp_text[:600]}"
                    )
                    return None

    async def _create_upload_url_aiohttp(
        self, session, auth_headers: Dict, img_path: str
    ) -> Optional[Dict]:
        ext = img_path.rsplit(".", 1)[-1].lower() if "." in img_path else "png"
        content_type = {
            "png": "image/png",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
        }.get(ext, "image/png")
        filename = os.path.basename(img_path)

        request_body = {"filename": filename, "content_type": content_type}
        logger.info(
            f"🔗 POST /v1/media/create-upload-url — "
            f"{json.dumps(request_body, ensure_ascii=False)}"
        )

        async with session.post(
            f"{POSTFORME_BASE}/v1/media/create-upload-url",
            json=request_body,
            headers=auth_headers,
            timeout=aiohttp.ClientTimeout(total=30),
        ) as resp:
            resp_text = await resp.text()
            logger.info(
                f"🔗 /v1/media/create-upload-url → HTTP {resp.status} | {resp_text[:300]}"
            )

            if resp.status in (200, 201):
                try:
                    return json.loads(resp_text)
                except Exception as exc:
                    logger.error(f"❌ Failed to parse upload-url response: {exc}")
                    return None
            else:
                logger.error(
                    f"❌ create-upload-url failed: HTTP {resp.status} — {resp_text[:400]}"
                )
                return None

    async def _upload_to_signed_url_aiohttp(
        self, session, upload_url: str, img_path: str
    ) -> bool:
        if not upload_url:
            logger.error("❌ No upload_url provided to _upload_to_signed_url_aiohttp")
            return False

        ext = img_path.rsplit(".", 1)[-1].lower() if "." in img_path else "png"
        content_type = {
            "png": "image/png",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
        }.get(ext, "image/png")

        with open(img_path, "rb") as fh:
            img_bytes = fh.read()

        logger.info(
            f"⬆️  PUT {upload_url[:80]}… — {len(img_bytes)} bytes, {content_type}"
        )

        async with session.put(
            upload_url,
            data=img_bytes,
            headers={"Content-Type": content_type},
            timeout=aiohttp.ClientTimeout(total=120),
        ) as resp:
            resp_text = await resp.text()
            logger.info(f"⬆️  PUT signed URL → HTTP {resp.status} | {resp_text[:150]}")

            if resp.status in (200, 201, 204):
                return True
            logger.error(
                f"❌ PUT signed URL failed: HTTP {resp.status} — {resp_text[:400]}"
            )
            return False

    # ─── urllib (sync) fallback ──────────────────────────────────

    def _post_carousel_sync(
        self, image_paths: List[str], caption: str, auth_headers: Dict
    ) -> Optional[Dict]:
        """Synchronous urllib fallback for environments without aiohttp."""
        media: List[Dict] = []

        for i, img_path in enumerate(image_paths):
            label = f"image {i + 1}/{len(image_paths)}"

            # Step 1: get upload URL
            logger.info(f"📤 [{label}] Step 1 — requesting upload URL (sync)…")
            upload_info = self._create_upload_url_sync(auth_headers, img_path)
            if not upload_info:
                logger.error(f"❌ [{label}] Failed to obtain upload URL — aborting")
                return None

            upload_url = (
                upload_info.get("upload_url")
                or upload_info.get("uploadUrl")
                or upload_info.get("signedUrl")
            )
            media_url = (
                upload_info.get("url")
                or upload_info.get("media_url")
                or upload_info.get("mediaUrl")
                or upload_info.get("fileUrl")
            )
            media_id = (
                upload_info.get("id")
                or upload_info.get("media_id")
                or upload_info.get("mediaId")
            )

            if not upload_url:
                logger.error(f"❌ [{label}] No upload_url in response")
                return None

            # Step 2: PUT bytes to signed URL
            logger.info(f"⬆️  [{label}] Step 2 — uploading (sync)…")
            if not self._upload_to_signed_url_sync(upload_url, img_path):
                logger.error(f"❌ [{label}] Upload failed — aborting")
                return None

            entry: Dict = {"type": "image"}
            if media_id:
                entry["id"] = media_id
            if media_url:
                entry["url"] = media_url
            media.append(entry)

        # Step 3: publish
        post_body: Dict = {
            "social_accounts": [self.ig_id],
            "media": media,
            "caption": caption,
        }
        data = json.dumps(post_body, ensure_ascii=False).encode("utf-8")
        req = urllib.request.Request(
            f"{POSTFORME_BASE}/social-posts",
            data=data,
            headers=auth_headers,
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                result = json.loads(resp.read().decode())
                logger.info(f"✅ Posted (sync): HTTP {resp.status}")
                return result
        except urllib.error.HTTPError as exc:
            body_text = exc.read().decode() if exc.fp else ""
            logger.error(f"❌ HTTP {exc.code}: {body_text[:400]}")
            return None
        except urllib.error.URLError as exc:
            logger.error(f"❌ Connection error: {exc.reason}")
            return None

    def _create_upload_url_sync(self, auth_headers: Dict, img_path: str) -> Optional[Dict]:
        ext = img_path.rsplit(".", 1)[-1].lower() if "." in img_path else "png"
        content_type = {
            "png": "image/png",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
        }.get(ext, "image/png")
        filename = os.path.basename(img_path)

        request_body = json.dumps(
            {"filename": filename, "content_type": content_type}, ensure_ascii=False
        ).encode("utf-8")
        req = urllib.request.Request(
            f"{POSTFORME_BASE}/v1/media/create-upload-url",
            data=request_body,
            headers=auth_headers,
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as exc:
            body_text = exc.read().decode() if exc.fp else ""
            logger.error(f"❌ create-upload-url HTTP {exc.code}: {body_text[:300]}")
            return None
        except urllib.error.URLError as exc:
            logger.error(f"❌ create-upload-url connection error: {exc.reason}")
            return None

    def _upload_to_signed_url_sync(self, upload_url: str, img_path: str) -> bool:
        ext = img_path.rsplit(".", 1)[-1].lower() if "." in img_path else "png"
        content_type = {
            "png": "image/png",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
        }.get(ext, "image/png")

        with open(img_path, "rb") as fh:
            img_bytes = fh.read()

        req = urllib.request.Request(
            upload_url,
            data=img_bytes,
            headers={"Content-Type": content_type},
            method="PUT",
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                logger.info(f"✅ PUT signed URL → HTTP {resp.status}")
                return True
        except urllib.error.HTTPError as exc:
            body_text = exc.read().decode() if exc.fp else ""
            logger.error(f"❌ PUT signed URL HTTP {exc.code}: {body_text[:300]}")
            return False
        except urllib.error.URLError as exc:
            logger.error(f"❌ PUT signed URL connection error: {exc.reason}")
            return False
