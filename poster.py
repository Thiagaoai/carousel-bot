"""
Poster â postforme.dev API client for Instagram carousel posting.
"""

import os
import json
import base64
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


class PostformeClient:
    """Post carousels to Instagram via postforme.dev API."""

    API_URL = "https://api.postforme.dev/social-posts"

    def __init__(self, api_key: str = "", spc_id: str = ""):
        self.api_key = api_key or os.environ.get("POSTFORME_API_KEY", "")
        self.spc_id = spc_id or os.environ.get("POSTFORME_SPC_ID", "")

    async def post_carousel(self, image_paths: List[str], caption: str) -> Optional[Dict]:
        """Post a carousel with multiple images to Instagram."""

        if not self.api_key or not self.spc_id:
            logger.error("Missing POSTFORME_API_KEY or POSTFORME_SPC_ID")
            return None

        # Build media array
        media = []
        for img_path in image_paths:
            if img_path.startswith("http"):
                media.append({"url": img_path, "type": "image"})
            elif os.path.exists(img_path):
                # Convert to base64 data URL
                with open(img_path, "rb") as f:
                    b64 = base64.b64encode(f.read()).decode()
                ext = img_path.rsplit(".", 1)[-1].lower()
                mime = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg"}.get(ext, "image/png")
                media.append({"url": f"data:{mime};base64,{b64}", "type": "image"})

        body = {
            "social_platform_connections": [self.spc_id],
            "media": media,
            "caption": caption,
            "post_type": "carousel",
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        logger.info(f"Posting carousel with {len(media)} images...")

        if HAS_AIOHTTP:
            return await self._post_aiohttp(body, headers)
        else:
            return await self._post_urllib(body, headers)

    async def _post_aiohttp(self, body: Dict, headers: Dict) -> Optional[Dict]:
        """Post using aiohttp."""
        async with aiohttp.ClientSession() as session:
            async with session.post(
                self.API_URL, json=body, headers=headers,
                timeout=aiohttp.ClientTimeout(total=120)
            ) as resp:
                if resp.status in (200, 201):
                    result = await resp.json()
                    logger.info(f"â Posted successfully: {resp.status}")
                    return result
                else:
                    text = await resp.text()
                    logger.error(f"â Post failed: HTTP {resp.status} â {text[:300]}")
                    return None

    async def _post_urllib(self, body: Dict, headers: Dict) -> Optional[Dict]:
        """Post using urllib (fallback)."""
        import asyncio
        return await asyncio.to_thread(self._post_sync, body, headers)

    def _post_sync(self, body: Dict, headers: Dict) -> Optional[Dict]:
        """Synchronous post."""
        data = json.dumps(body).encode("utf-8")
        req = urllib.request.Request(self.API_URL, data=data, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                result = json.loads(resp.read().decode())
                logger.info(f"â Posted: {resp.status}")
                return result
        except urllib.error.HTTPError as e:
            error_body = e.read().decode() if e.fp else ""
            logger.error(f"â HTTP {e.code}: {error_body[:300]}")
            return None
        except urllib.error.URLError as e:
            logger.error(f"â Connection error: {e.reason}")
            return None
