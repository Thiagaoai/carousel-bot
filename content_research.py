"""
Content Researcher — Tavily API + Perplexity fallback.
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


class ContentResearcher:
    """Research content and generate card data."""

    def __init__(self, api_key: str = "", perplexity_key: str = ""):
        self.api_key = api_key or os.environ.get("TAVILY_API_KEY", "")
        self.perplexity_key = perplexity_key or os.environ.get("PERPLEXITY_API_KEY", "")

    async def research(self, tema: str, tom: str, qtd: int) -> Dict:
        """Full research pipeline: search → extract → structure cards."""
        search_results = await self._search(tema)
        cards_data = await self._generate_cards(tema, tom, qtd, search_results)
        return cards_data

    async def _search(self, tema: str) -> str:
        """Search for real data about the topic."""
        if self.api_key:
            result = await self._search_tavily(tema)
            if result:
                return result

        if self.perplexity_key:
            result = await self._search_perplexity(tema)
            if result:
                return result

        logger.warning("No search API available — using built-in knowledge only")
        return ""

    async def _search_tavily(self, tema: str) -> str:
        """Search via Tavily API."""
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
                data = json.dumps(body, ensure_ascii=False).encode("utf-8")
                req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=30) as resp:
                    result = json.loads(resp.read().decode())
                    return result.get("answer", "")
        except Exception as e:
            logger.error(f"Tavily search error: {e}")

        return ""

    async def _search_perplexity(self, tema: str) -> str:
        """Search via Perplexity API (sonar model)."""
        url = "https://api.perplexity.ai/chat/completions"
        body = {
            "model": "sonar",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a research assistant. Provide factual data, statistics, and insights. Be concise."
                },
                {
                    "role": "user",
                    "content": (
                        f"Research '{tema}' and provide: "
                        f"1. Key statistics and data points (2024-2026) "
                        f"2. Real examples and case studies "
                        f"3. Surprising facts or trends "
                        f"Format as bullet points. Be specific with numbers."
                    )
                }
            ],
            "max_tokens": 800,
        }
        headers = {
            "Authorization": f"Bearer {self.perplexity_key}",
            "Content-Type": "application/json",
        }

        try:
            if HAS_AIOHTTP:
                async with aiohttp.ClientSession() as session:
                    async with session.post(url, json=body, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as resp:
                        if resp.status == 200:
                            result = await resp.json()
                            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                            logger.info(f"Perplexity research: {len(content)} chars")
                            return content
                        else:
                            text = await resp.text()
                            logger.error(f"Perplexity error {resp.status}: {text[:200]}")
            else:
                data = json.dumps(body, ensure_ascii=False).encode("utf-8")
                req = urllib.request.Request(url, data=data, headers=headers, method="POST")
                with urllib.request.urlopen(req, timeout=30) as resp:
                    result = json.loads(resp.read().decode())
                    return result.get("choices", [{}])[0].get("message", {}).get("content", "")
        except Exception as e:
            logger.error(f"Perplexity search error: {e}")

        return ""

    async def _generate_cards(self, tema: str, tom: str, qtd: int, research: str) -> Dict:
        """Generate structured card content from research."""
        image_prompts = self._generate_image_prompts(tema, qtd)
        cards = self._generate_card_content(tema, tom, qtd, research)
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
        """Generate card headlines and captions."""
        cards = []

        cards.append({
            "type": "cover",
            "headline": f"{tema.upper()}\nVAI MUDAR TUDO",
            "caption": "Voce ainda nao sabe o impacto que isso vai ter.\nOs dados vao te surpreender.",
            "bg_color": "#1a0a2e",
            "bg_color_end": "#0f0f23",
        })

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
        caption = (
            f"{tema} esta transformando o jogo. E os numeros provam.\n"
            f"\n.\n.\n.\n\n"
        )

        for card in cards[1:-1]:
            caption += f"{card['caption']}\n\n"

        caption += (
            f"Salva esse post e manda pra alguem que precisa ver isso 👇\n\n"
            f"#{''.join(tema.split())} #IA #Tecnologia #Inovacao #Produtividade "
            f"#FuturoDoTrabalho #DockPlusAI #ThiagaoAI"
        )

        return caption
