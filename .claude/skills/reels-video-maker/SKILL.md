# Reels Video Maker
# Category: Visual | Production
# Priority: 1

## Purpose
Orchestrate the production of Instagram Reels across 3 tiers (HeyGen, fal.ai Kling 3.0, Remotion)
for 5 DockPlus ecosystem businesses, auto-selecting the optimal tier based on budget and content type.

## When to activate
- User requests a video, reel, or visual content for any DockPlus business
- User runs `/produce [company] [type] [theme]`
- video-producer agent dispatches this skill

## Protocol

### Step 1: Parse Input
Extract from user request:
```
COMPANY:    roberts | cheesebread | cape-codder | all-granite | dockplus-ai
VIDEO_TYPE: before-after | service-showcase | testimonial | tips | promo
THEME:      free text (e.g. "driveway transformation spring")
TIER_PREF:  1 | 2 | 3 | auto (default: auto)
```
If any required field is missing, ask in a single grouped message.

### Step 2: Budget Check
Query credit-budget-tracker for current month:
```
IF budget_remaining > $25:
  AVAILABLE_TIERS = [1, 2, 3]  (flexible)
ELIF budget_remaining > $10:
  AVAILABLE_TIERS = [2, 3]     (skip HeyGen)
ELIF budget_remaining > $5:
  AVAILABLE_TIERS = [3]        (Remotion only)
ELSE:
  AVAILABLE_TIERS = [3]        (free only)
  WARN: "Budget nearly exhausted. Next reset: 1st of next month."
```

### Step 3: Tier Selection
Auto-select based on content type + available tiers:

| Video Type | Preferred Tier | Fallback |
|---|---|---|
| testimonial | Tier 1 (HeyGen) | Tier 3 (quote card) |
| before-after | Tier 2 (fal.ai) | Tier 3 (split screen) |
| service-showcase | Tier 2 (fal.ai) | Tier 3 (4-panel grid) |
| tips | Tier 3 (Remotion) | — |
| promo | Tier 3 (Remotion) | — |

If preferred tier not in AVAILABLE_TIERS, use fallback.

### Step 4: Load Brand Preset
From brand-presets skill, load for COMPANY:
```
PRIMARY_COLOR:    hex
SECONDARY_COLOR:  hex
ACCENT_COLOR:     hex
FONT:             name
TONE:             descriptor
LOGO_PATH:        file path
```

### Step 5: Generate Outputs by Tier

#### Tier 1 — HeyGen
Produce:
1. **Script** (50-80 words) — dispatch to copy-specialist
2. **Avatar selection** recommendation (from HeyGen library)
3. **Voice** recommendation (EN, matching niche tone)
4. **Background** color (brand primary)
5. **Estimated cost:** $12/video

#### Tier 2 — fal.ai Kling 3.0
Produce:
1. **Visual prompt** (50-100 words) optimized for Kling 3.0
   Format: "[Subject] [Action] [Setting], [Lighting], [Camera], [Style], 9:16 aspect"
2. **Duration:** 15-30 seconds
3. **Estimated cost:** $0.87/30sec ($0.029/sec)

Company-specific prompt bank:
- Roberts: "Wide shot completed driveway, before-after split, golden hour, drone"
- Cheesebread: "Artisan bread baking close-up macro, warm lighting, ASMR"
- Cape Codder: "Kitchen renovation before/after slider, bright natural light"
- All Granite: "Granite slab textures close-up, light play, cinematic slow-mo"
- DockPlus AI: "AI automation workflow visualization, futuristic, neon accents"

#### Tier 3 — Remotion
Produce:
1. **Template selection** from 5 available:
   - `before-after-reveal.tsx` — split screen + animated slider (30s)
   - `service-showcase.tsx` — 4-panel grid + service icons (30s)
   - `testimonial-quote.tsx` — avatar + stars + rotating quotes (20s)
   - `educational-tips.tsx` — 3 tips carousel + CTA ending (45s)
   - `promo-offer.tsx` — countdown + discount badge + CTA (15s)
2. **Data payload** (text, images, brand tokens) to populate template
3. **Render command:** `npm run build:video`
4. **Estimated cost:** $0

### Step 6: Generate Supporting Assets
1. **5 Unsplash image URLs** matching theme (search query generated)
2. **Instagram caption** — dispatch to copy-specialist
3. **Hashtag set** (10-15 tags, niche-specific)

### Step 7: Budget Log
Record to credit-budget-tracker:
```
TIER: [selected]
COST: [estimated]
COMPANY: [name]
VIDEO_TYPE: [type]
DATE: [today]
```

### Step 8: Delivery
Output delivery standard block:
```
DONE: [tier] video package for [company] — [type]: [theme]
TEST: [how to render/generate — specific command]
MISSING: [what needs manual action — e.g. "Upload to HeyGen", "Run fal.ai prompt"]
NEXT: [single next action — e.g. "Run /deploy to publish via PostForMe"]
```

## Constraints
- Never produce without budget check (Step 2 is mandatory)
- Never use wrong brand colors — always load from brand-presets
- Never generate HeyGen scripts longer than 80 words
- Never generate fal.ai prompts without 9:16 aspect ratio specification
- Never skip the delivery standard block
- Remotion renders must target 1080x1920 (9:16), H.264, 5000kbps

## Fallback & Enhancement APIs

### Replicate (Tier 2 Fallback — when fal.ai is down or over budget)
```
API: REPLICATE_API_TOKEN
Models:
  - minimax/video-01-live (video generation — Kling alternative)
  - black-forest-labs/flux-1.1-pro (image generation for Remotion backgrounds)
  - lucataco/animate-diff (motion from still images)
When to use:
  - fal.ai returns error or quota exceeded
  - Need cheaper video generation ($0.02/sec vs $0.029/sec)
  - Need image-to-video conversion
Prompt format: same as fal.ai (text-to-video, include "9:16 aspect ratio")
```

### DeepSeek (Cheap Script Generation)
```
API: DEEPSEEK_API_KEY
Model: deepseek-chat
When to use:
  - Generating HeyGen scripts in bulk (cheaper than Claude)
  - Generating Instagram captions at scale (40/month)
  - Draft copy that copy-specialist refines
Cost: ~$0.001 per script (vs $0.01+ with Claude)
Prompt: include brand tone from brand-presets + word limit
```

### Perplexity (Trend Research)
```
API: PERPLEXITY_API_KEY
When to use:
  - Discovering trending topics for each company's niche
  - Seasonal content research (Cape Cod events, holidays)
  - Competitor content analysis
Query format: "trending [industry] Instagram Reels topics [season] [location]"
Output: feed results into video-content-calendar theme bank
```

## Output format
Single structured block containing all outputs from Steps 3-8,
ready for the user to execute (copy-paste prompts, run commands).
