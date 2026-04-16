"""
Card Engine — Generates 1080x1350 (4:5) carousel PNGs.
Uses Playwright to render HTML → PNG with premium design.
"""

import os
import json
import asyncio
import tempfile
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

WIDTH = 1080
HEIGHT = 1350


class CardEngine:
    """Generate premium Instagram carousel cards."""

    def __init__(self, handle: str = "@thiagaoai"):
        self.handle = handle
        self.output_dir = tempfile.mkdtemp(prefix="carousel_cards_")

    async def generate_cards(
        self,
        cards_data: List[Dict],
        bg_images: List[str],
        total: int,
        cta_text: str = "SALVA E COMPARTILHA"
    ) -> List[str]:
        """Generate all card PNGs. Returns list of file paths."""

        from playwright.async_api import async_playwright

        card_paths = []

        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page(viewport={"width": WIDTH, "height": HEIGHT})

            for i, card in enumerate(cards_data):
                bg_img = bg_images[i] if i < len(bg_images) else None
                is_cta = card.get("type") == "cta"

                if is_cta:
                    card["cta_text"] = cta_text

                html = self._render_card_html(card, i, total, bg_img)

                # Save HTML (debug)
                html_path = os.path.join(self.output_dir, f"card_{i+1}.html")
                with open(html_path, "w", encoding="utf-8") as f:
                    f.write(html)

                # Screenshot
                png_path = os.path.join(self.output_dir, f"card_{i+1}.png")
                await page.set_content(html, wait_until="networkidle")
                await page.wait_for_timeout(600)
                await page.screenshot(path=png_path)

                card_paths.append(png_path)
                logger.info(f"✅ Card {i+1}/{total} generated: {png_path}")

            await browser.close()

        return card_paths

    def _render_card_html(self, card: Dict, idx: int, total: int, bg_image_path: Optional[str] = None) -> str:
        """Render a single card as HTML."""

        is_cover = card.get("type") == "cover"
        is_cta = card.get("type") == "cta"

        # Background image as base64 or gradient
        bg_image_css = ""
        if bg_image_path and os.path.exists(bg_image_path):
            import base64
            with open(bg_image_path, "rb") as f:
                b64 = base64.b64encode(f.read()).decode()
            ext = bg_image_path.rsplit(".", 1)[-1]
            bg_image_css = f"background-image: url(data:image/{ext};base64,{b64}); background-size: cover; background-position: center;"

        # Counter
        counter_html = ""
        if not is_cover and not is_cta:
            counter_idx = card.get("index", idx + 1)
            counter_html = f'''
            <div style="position:absolute;top:28px;left:28px;
                font-family:'Inter',sans-serif;font-weight:700;font-size:20px;
                color:#FFF;background:rgba(0,0,0,0.55);backdrop-filter:blur(8px);
                padding:8px 16px;border-radius:10px;z-index:10;
                border:1px solid rgba(255,255,255,0.1);">
                {counter_idx}/{total}
            </div>'''

        # Nav label
        nav_label = "SALVA E COMPARTILHA" if is_cta else "ARRASTA PRO LADO &gt;&gt;&gt;"

        # CTA button
        cta_html = ""
        if is_cta:
            cta_text = card.get("cta_text", "SALVA E COMPARTILHA")
            cta_html = f'''
            <div style="text-align:center;margin:24px 0;">
                <span style="display:inline-block;font-family:'Inter',sans-serif;
                    font-weight:700;font-size:20px;color:#000;
                    background:linear-gradient(135deg,#FFFFFF,#E0E0E0);
                    padding:16px 44px;border-radius:50px;
                    box-shadow:0 4px 20px rgba(255,255,255,0.25);">
                    {cta_text}
                </span>
            </div>'''

        # Dots
        dots_html = ""
        for i in range(total):
            if i == idx:
                dots_html += '<span style="display:inline-block;width:24px;height:8px;border-radius:40px;background:#FFFFFF;margin:0 4px;"></span>'
            else:
                dots_html += '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.25);margin:0 4px;"></span>'

        headline = card.get("headline", "").replace("\n", "<br>")
        caption = card.get("caption", "").replace("\n", "<br>")

        return f'''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ width:{WIDTH}px; height:{HEIGHT}px; overflow:hidden; font-family:'Inter',sans-serif; background:#000; }}
</style>
</head>
<body>
<div style="width:{WIDTH}px;height:{HEIGHT}px;position:relative;background:#050510;">

  {counter_html}

  <!-- Image area (top 58%) -->
  <div style="height:58%;position:relative;overflow:hidden;{bg_image_css}">
    <!-- Gradient overlay on image -->
    <div style="position:absolute;inset:0;background:linear-gradient(to bottom,
        rgba(5,5,16,0) 0%,
        rgba(5,5,16,0) 50%,
        rgba(5,5,16,0.6) 75%,
        rgba(5,5,16,1) 100%);
        z-index:2;">
    </div>
  </div>

  <!-- Text content area (bottom 42%) -->
  <div style="height:42%;padding:0 52px 24px;display:flex;flex-direction:column;justify-content:space-between;position:relative;z-index:5;">

    <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-start;padding-top:8px;">
      <!-- Accent line -->
      <div style="width:48px;height:3px;background:linear-gradient(90deg,#a855f7,#6366f1);border-radius:2px;margin-bottom:20px;"></div>

      <!-- Headline -->
      <div style="font-weight:900;font-size:44px;color:#FFFFFF;text-transform:uppercase;line-height:1.06;margin-bottom:16px;letter-spacing:-0.5px;">
        {headline}
      </div>

      <!-- Caption -->
      <div style="font-weight:400;font-size:24px;color:rgba(255,255,255,0.65);line-height:1.5;">
        {caption}
      </div>
    </div>

    {cta_html}

    <!-- Nav -->
    <div style="text-align:center;padding-bottom:2px;">
      <div style="font-weight:500;font-size:14px;color:rgba(255,255,255,0.3);letter-spacing:0.2em;text-transform:uppercase;margin-bottom:10px;">{nav_label}</div>
      <div style="display:flex;justify-content:center;gap:6px;margin-bottom:10px;">
        {dots_html}
      </div>
    </div>
  </div>

  <!-- Handle -->
  <div style="position:absolute;bottom:14px;right:40px;z-index:10;">
    <span style="font-weight:600;font-size:22px;color:#FFFFFF;opacity:0.9;">{self.handle}</span>
  </div>

</div>
</body>
</html>'''
