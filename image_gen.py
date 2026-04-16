"""
Image Generator — fal.ai integration for carousel backgrounds.
Supports: watercolor, cinematic, anime, 3D Pixar, dark tech styles.
"""

import os
import json
import asyncio
import tempfile
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

# Use aiohttp if available, fallback to urllib
try:
    import aiohttp
    HAS_AIOHTTP = True
except ImportError:
    HAS_AIOHTTP = False
    import urllib.request
    import urllib.error


class ImageGenerator:
    """Generate AI images via fal.ai or Replicate."""

    def __init__(self, fal_key: str = "", replicate_token: str = ""):
        self.fal_key = fal_key or os.environ.get("FAL_KEY", "")
        self.replicate_token = replicate_token or os.environ.get("REPLICATE_API_TOKEN", "")
        self.output_dir = tempfile.mkdtemp(prefix="carousel_bg_")

    async def generate_batch(
        self,
        prompts: List[str],
        style: str = "cinematico",
        style_suffix: str = "",
        provider: str = "fal"
    ) -> List[str]:
        """Generate a batch of images. Returns list of file paths."""
        tasks = []
        for i, prompt in enumerate(prompts):
            full_prompt = f"{prompt}, {style_suffix}, no text, no watermark, no letters, no words"
            output_path = os.path.join(self.output_dir, f"bg_{i+1}.png")

            if provider == "fal" and self.fal_key:
                tasks.append(self._generate_fal(full_prompt, output_path))
            elif provider == "replicate" and self.replicate_token:
                tasks.append(self._generate_replicate(full_prompt, output_path))
            else:
                # Fallback: try fal first, then replicate
                if self.fal_key:
                    tasks.append(self._generate_fal(full_prompt, output_path))
                elif self.replicate_token:
                    tasks.append(self._generate_replicate(full_prompt, output_path))
                else:
                    logger.warning("No image generation API key available!")
                    tasks.append(self._generate_placeholder(output_path))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        paths = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Image {i+1} failed: {result}")
                # Generate placeholder
                placeholder = os.path.join(self.output_dir, f"bg_{i+1}.png")
                await self._generate_placeholder(placeholder)
                paths.append(placeholder)
            elif result:
                paths.append(result)
            else:
                placeholder = os.path.join(self.output_dir, f"bg_{i+1}.png")
                await self._generate_placeholder(placeholder)
                paths.append(placeholder)

        return paths

    async def _generate_fal(self, prompt: str, output_path: str) -> Optional[str]:
        """Generate image via fal.ai Flux Schnell."""
        url = "https://fal.run/fal-ai/flux/schnell"
        body = {
            "prompt": prompt,
            "image_size": {"width": 1080, "height": 1350},
            "num_inference_steps": 4,
            "num_images": 1,
            "enable_safety_checker": True,
        }
        headers = {
            "Authorization": f"Key {self.fal_key}",
            "Content-Type": "application/json",
        }

        if HAS_AIOHTTP:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=body, headers=headers, timeout=aiohttp.ClientTimeout(total=60)) as resp:
                    if resp.status != 200:
                        text = await resp.text()
                        logger.error(f"fal.ai error {resp.status}: {text[:200]}")
                        return None
                    result = await resp.json()
                    if "images" in result and result["images"]:
                        image_url = result["images"][0].get("url")
                        if image_url:
                            async with session.get(image_url) as img_resp:
                                with open(output_path, "wb") as f:
                                    f.write(await img_resp.read())
                            logger.info(f"✅ fal.ai image saved: {output_path}")
                            return output_path
        else:
            # Sync fallback
            return await asyncio.to_thread(self._generate_fal_sync, prompt, output_path, url, body, headers)

        return None

    def _generate_fal_sync(self, prompt, output_path, url, body, headers):
        """Synchronous fal.ai call."""
        import urllib.request
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                result = json.loads(response.read().decode())
                if "images" in result and result["images"]:
                    image_url = result["images"][0].get("url")
                    if image_url:
                        urllib.request.urlretrieve(image_url, output_path)
                        return output_path
        except Exception as e:
            logger.error(f"fal.ai sync error: {e}")
        return None

    async def _generate_replicate(self, prompt: str, output_path: str) -> Optional[str]:
        """Generate image via Replicate Flux Schnell."""
        url = "https://api.replicate.com/v1/predictions"
        body = {
            "model": "black-forest-labs/flux-schnell",
            "input": {
                "prompt": prompt,
                "width": 1080,
                "height": 1350,
                "num_outputs": 1,
                "aspect_ratio": "4:5",
            }
        }
        headers = {
            "Authorization": f"Bearer {self.replicate_token}",
            "Content-Type": "application/json",
            "Prefer": "wait",
        }

        if HAS_AIOHTTP:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=body, headers=headers, timeout=aiohttp.ClientTimeout(total=180)) as resp:
                    result = await resp.json()

                    if result.get("status") == "succeeded" and result.get("output"):
                        output = result["output"]
                        image_url = output[0] if isinstance(output, list) else output
                        async with session.get(image_url) as img_resp:
                            with open(output_path, "wb") as f:
                                f.write(await img_resp.read())
                        return output_path

                    # Poll if needed
                    if result.get("status") in ("starting", "processing"):
                        poll_url = result.get("urls", {}).get("get", f"{url}/{result['id']}")
                        return await self._poll_replicate(session, poll_url, output_path)
        return None

    async def _poll_replicate(self, session, poll_url, output_path, max_attempts=30):
        """Poll Replicate for completion."""
        headers = {"Authorization": f"Bearer {self.replicate_token}"}
        for _ in range(max_attempts):
            await asyncio.sleep(2)
            async with session.get(poll_url, headers=headers) as resp:
                result = await resp.json()
                if result.get("status") == "succeeded" and result.get("output"):
                    output = result["output"]
                    image_url = output[0] if isinstance(output, list) else output
                    async with session.get(image_url) as img_resp:
                        with open(output_path, "wb") as f:
                            f.write(await img_resp.read())
                    return output_path
                if result.get("status") == "failed":
                    return None
        return None

    async def _generate_placeholder(self, output_path: str) -> str:
        """Generate a simple gradient placeholder PNG."""
        # Create a simple 1080x1350 gradient using PIL or raw bytes
        try:
            from PIL import Image, ImageDraw
            img = Image.new("RGB", (1080, 1350))
            draw = ImageDraw.Draw(img)
            for y in range(1350):
                r = int(15 + (y / 1350) * 20)
                g = int(10 + (y / 1350) * 15)
                b = int(35 + (y / 1350) * 30)
                draw.line([(0, y), (1080, y)], fill=(r, g, b))
            img.save(output_path)
        except ImportError:
            # Minimal PNG: create a tiny valid PNG
            with open(output_path, "wb") as f:
                # 1x1 pixel dark purple PNG
                f.write(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82')

        return output_path
