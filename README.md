# Agente Mídia

Gerenciador e criador de mídia multi-plataforma. Um bot Telegram que produz carrosséis, reels, posts, tweets, threads, Shorts, TikToks, ads e mais — para 6 marcas DockPlus.

## O que faz

Uma única interface (Telegram) → todas as plataformas:

| Plataforma | Formatos |
|---|---|
| Instagram | Carrossel 4:5, Reel 9:16, Story 9:16 |
| TikTok | Vídeo 9:16 + trending sound |
| YouTube Shorts | Vídeo 9:16 + SEO metadata |
| LinkedIn | Post, Article, Document Carousel, Video |
| Twitter/X | Tweet único, Thread 5-12 tweets |
| Facebook | Post, Reel, Event |
| Ads | Meta, Google, TikTok, LinkedIn (matriz 5×5×3) |

## Arquitetura

**13 agentes especializados** dispatchados por um orquestrador mestre:

```
orchestrator → carousel-agent | reels-agent | tiktok-agent | youtube-shorts-agent
             | linkedin-agent | twitter-agent | facebook-agent | ads-agent
             | hashtag-agent | copywriter-agent | analytics-agent | design-agent
```

**5 skills compartilhadas:** brand-presets, hook-writer, hashtag-researcher, content-repurposer, platform-specs, multi-platform-publisher.

## Service tier matrix

### Vídeo (fallback chain)
HeyGen (avatar) → fal.ai Kling → Runway Gen-4 → Higgsfield → Replicate Zeroscope → Remotion (local, grátis)

### Imagem
fal.ai FLUX Pro Ultra → FLUX Schnell → Replicate SDXL/FLUX

### Áudio
ElevenLabs TTS multilingual v2 — com word-level timestamps pra captions

### Design
Canva MCP → Figma MCP → Claude Design → fal.ai

## Comandos

### Criação por plataforma
```
/carousel [company] [theme]
/reel     [company] [theme]
/tiktok   [company] [theme]
/youtube  [company] [theme]
/linkedin [company] [theme] [format]
/tweet    [company] [theme]
/thread   [company] [theme]
/facebook [company] [theme]
/design   [type] [company] [prompt]
```

### Ads
```
/ad       [platform] [company] [objective]
/ads-set  [platform] [company] [campaign]      # 5×5×3 matrix
```

### Multi-plataforma
```
/midia-full [company] [theme]                  # gera tudo de 1 tema
/repurpose  [jobId] [platforms]                # adapta asset existente
/publish    [jobId] [platforms]                # broadcast
```

### Utilities
```
/tags      [platform] [theme]
/analytics [company] [period]
/budget    [month]
/calendar  [month]
/scaffold  [company]
```

## Stack

- **Runtime:** Node.js 20, pnpm
- **Bot:** Telegram (long-polling, single instance)
- **Render local:** Playwright Chromium (cards) + Remotion (vídeo)
- **Database:** Supabase (PostgreSQL)
- **Publicação:** PostForMe (IG/FB) + native APIs (Twitter, LinkedIn, TikTok, YouTube)

## Budget

- **Hard cap:** $200/mês
- **Alerta:** 80% = $160
- **Check `/budget` antes de qualquer tier pago**

## Marcas cadastradas

| Brand | Slug | Industry |
|---|---|---|
| Roberts Landscape | `roberts` | Landscape / hardscape |
| Cheesebread Bakery | `cheesebread` | Brazilian bakery |
| Cape Codder HI | `cape-codder` | Home improvement |
| All Granite & Stone | `all-granite` | Stone countertops |
| DockPlus AI | `dockplus-ai` | AI automation |
| Thiago do Carmo (ThiagaoAI) | `thiagaoai` | AI news / personal brand |

## Quick start

```bash
pnpm install
cp .env.example .env     # preencher credenciais
node telegram-carousel-bot.js
```

No Telegram, mandar `/start` ou `/carousel`.

## Estrutura

```
.claude/
  agents/       # 13 agentes especializados
  skills/       # hashtag-researcher, hook-writer, platform-specs, etc.
  commands/     # slash commands (/reel, /tweet, /linkedin, ...)
services/       # clientes API (ElevenLabs, Replicate, Runway, HeyGen, Higgsfield)
remotion-templates/    # TSX templates pros Reels
carousel-*.js   # engine do carrossel (config, story, image, renderer, research, storage)
telegram-carousel-bot.js  # interface operador
agente-midia-config.js    # platforms + tier matrix
```

## Regras críticas

1. Nunca pedir autorização — executar e mostrar BEFORE/AFTER
2. Sempre `/reflexion` antes de entregar
3. Nunca exceder $200/mês
4. Todo output termina com DONE / TEST / MISSING / NEXT
5. Cards editoriais: Inter 38px body, Cormorant Garamond 76px headline — TRAVADO
6. Chat sempre em PT-BR, código em inglês
