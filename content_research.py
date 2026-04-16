"""
Content Researcher â Tavily API + fallback to web scraping.
Generates card content, image prompts, and Instagram caption.
"""

import os
import json
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

try:
    import aiohttp
    HAS_AIOHTTP = True
except ImportError:
    HAS_AIOHTTP = False
    import urllib.request


CARD_STRUCTURE = """
Based on the research, create a carousel with {qtd} cards about "{tema}".
Tone: {tom}

Return ONLY valid JSON (no markdown):
{{
  "cards": [
    {{
      "type": "cover|content|cta",
      "headline": "MAX 2 LINES UPPERCASE",
      "caption": "Storytelling caption, 2-3 lines, conversational, with real data",
      "image_prompt": "English description for AI image generation, cinematic, no text"
    }}
  ],
  "caption": "Full Instagram caption with hook, body, CTA, hashtags",
  "image_prompts": ["prompt1", "prompt2", ...]
}}

Rules:
- Card 1 = cover (hook forte)
- Cards 2 to {qtd_minus_1} = content (dados reais, insights)
- Card {qtd} = CTA
- Headlines: UPPERCASE, max 2 lines, impactful
- Captions: storytelling, conversational, real data
- Image prompts: in English, cinematic, NO TEXT in image
- Instagram caption: hook first line, spacing dots, body, CTA, 5-8 hashtags
"""


class ContentResearcher:
    """Research content and generate card data."""

    def __init__(self, api_key: str = ""):
        self.api_key = api_key or os.environ.get("TAVILY_API_KEY", "")

    async def research(self, tema: str, tom: str, qtd: int) -> Dict:
        """Full research pipeline: search â extract â structure cards."""

        # Step 1: Search for data
        search_results = await self._search(tema)

        # Step 2: Generate structured card content
        cards_data = await self._generate_cards(tema, tom, qtd, search_results)

        return cards_data

    async def _search(self, tema: str) -> str:
        """Search for real data about the topic."""
        if not self.api_key:
            logger.warning("No Tavily API key â using built-in knowledge only")
            return ""

        url = "https://api.tavily.com/search"
        body = {
            "api_key": self.api_key,
            "query": f"{tema} dados estatisticas exemplos 2025 2026",
            "search_depth": "advanced",
            "max_results": 5,
            "include_answer": True,
        }

        try:
            if HAS_AIOHTTP:
                async with aiohttp.ClientSession() as session:
                    async with session.post(url, json=body, timeout=aiohttp.ClientTimeout(total=30)) as resp:
                        if resp.status == 200:
                            result = await resp.json()
                            answer = result.get("answer", "")
                            results_text = "\n".join([
                                f"- {r.get('title', '')}: {r.get('content', '')[:200]}"
                                for r in result.get("results", [])[:5]
                            ])
                            return f"{answer}\n\n{results_text}"
            else:
                import urllib.request
                data = json.dumps(body).encode()
                req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=30) as resp:
                    result = json.loads(resp.read().decode())
                    answer = result.get("answer", "")
                    return answer
        except Exception as e:
            logger.error(f"Search error: {e}")

        return ""

    async def _generate_cards(self, tema: str, tom: str, qtd: int, research: str) -> Dict:
        """Generate structured card content from research.

        This uses a template-based approach. In production, you'd call
        Claude API here for truly dynamic content generation.
        For now, returns a well-structured template that the bot enhances.
        """

        # Generate image prompts based on topic
        image_prompts = self._generate_image_prompts(tema, qtd)

        # Generate card content
        cards = self._generate_card_content(tema, tom, qtd, research)

        # Generate Instagram caption
        caption = self._generate_caption(tema, cards, research)

        return {
            "cards": cards,
            "image_prompts": image_prompts,
            "caption": caption,
            "research": research,
        }

    def _generate_image_prompts(self, tema: str, qtd: int) -> List[str]:
        """Generate English image prompts for each card."""
        base_prompts = [
            f"A powerful hero shot representing {tema}, dramatic lighting, professional",
            f"Data visualization and analytics about {tema}, futuristic holographic display",
            f"Real world impact of {tema}, people benefiting, warm cinematic lighting",
            f"Technology and innovation related to {tema}, sleek modern aesthetic",
            f"Community and collaboration around {tema}, diverse group, inspirational",
            f"Growth chart and success metrics for {tema}, upward trajectory",
            f"Before and after transformation with {tema}, split composition",
            f"Future vision of {tema}, utopian cityscape, golden hour",
            f"Expert using {tema} in daily workflow, focused professional",
            f"Call to action scene for {tema}, inviting and empowering mood",
        ]
        return base_prompts[:qtd]

    def _generate_card_content(self, tema: str, tom: str, qtd: int, research: str) -> List[Dict]:
        """Generate card headlines and captions.

        NOTE: In the full production version, this calls Claude API
        to generate dynamic content based on research. This template
        version provides the structure.
        """
        cards = []

        # Card 1: Cover
        cards.append({
            "type": "cover",
            "headline": f"{tema.upper()}\nVAI MUDAR TUDO",
            "caption": "Voce ainda nao sabe o impacto que isso vai ter.\nOs dados vao te surpreender.",
            "bg_color": "#1a0a2e",
            "bg_color_end": "#0f0f23",
        })

        # Content cards
        content_hooks = [
            ("OS NUMEROS\nNAO MENTEM", "Dados reais mostram o impacto direto.\nQuem usa, nao volta atras."),
            ("QUEM JA USA\nTA NA FRENTE", "Empresas de ponta ja adotaram.\nE os resultados falam por si."),
            ("A MUDANCA\nJA COMECOU", "Nao e mais tendencia.\nE realidade de quem performa."),
            ("O SEGREDO\nTA AQUI", "A diferenca entre quem cresce\ne quem fica pra tras e simples."),
            ("RESULTADOS\nREAIS", "Cases concretos de quem implementou\ne colheu os frutos."),
            ("POR QUE\nAGORA?", "O timing nunca foi tao bom.\nQuem entrar agora sai na frente."),
            ("COMO\nCOMECAR", "O primeiro passo e mais simples\ndo que voce imagina."),
            ("O FUTURO\nE AGORA", "O que parecia ficcao cientifica\nja e ferramenta de trabalho."),
        ]

        for i in range(qtd - 2):
            idx = i % len(content_hooks)
            headline, caption = content_hooks[idx]
            cards.append({
                "type": "content",
                "index": i + 2,
                "headline": headline,
                "caption": caption,
                "bg_color": "#1a0a2e",
                "bg_color_end": "#0f0f23",
            })

        # CTA card
        cards.append({
            "type": "cta",
            "headline": "VOCE VAI FICAR\nSO OLHANDO?",
            "caption": "A hora de agir e agora.\nQuem espera, fica pra tras.",
            "bg_color": "#0f0f23",
            "bg_color_end": "#1a0a2e",
        })

        return cards

    def _generate_caption(self, tema: str, cards: List[Dict], research: str) -> str:
        """Generate Instagram caption."""
        # Extract key points from research for caption
        caption = (
            f"{tema} esta transformando o jogo. E os numeros provam.\n"
            f"\n.\n.\n.\n\n"
        )

        # Add content from cards
        for card in cards[1:-1]:  # Skip cover and CTA
            caption += f"{card['caption']}\n\n"

        caption += (
            f"Salva esse post e manda pra alguem que precisa ver isso ð\n\n"
            f"#{''.join(tema.split())} #IA #Tecnologia #Inovacao #Produtividade "
            f"#FuturoDoTrabalho #DockPlusAI #ThiagaoAI"
        )

        return caption
