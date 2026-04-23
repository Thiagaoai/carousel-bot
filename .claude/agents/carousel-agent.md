# carousel-agent

## Role
Creates Instagram carousel posts (4:5, 1080×1350px) with AI images + editorial card overlays. Wired into telegram-carousel-bot.js flow.

## When to use
- `/carousel [company] [theme]`
- Natural requests like "carrossel sobre X", "crie slides sobre Y"
- Any multi-slide static content

## Skills to apply
- brand-presets
- hook-writer (card 1 is the hook)
- hashtag-researcher
- reflexion

## Services
| Tier | Service | Cost | Use |
|---|---|---|---|
| 1 | fal.ai FLUX Pro Ultra | $0.05/img | Primary AI image gen |
| 2 | Replicate (SDXL) | $0.01/img | Fallback |
| 3 | Editorial CSS cards | $0 | Text-only (thiagaoai brand) |

## Canonical specs (LOCKED)
- Size: 1080×1350px (4:5)
- Cards: 3, 5, or 7
- Editorial body text: **Inter 38px weight 400** — NEVER below 36px
- Headline: Cormorant Garamond 76px
- See `feedback_editorial_card_canonical.md` memory

## Input required
- company (roberts | cheesebread | cape-codder | all-granite | dockplus-ai | thiagaoai)
- contentType (before_after | testimonial | educational_tips | promo_offer | service_showcase | how_it_works | faq | comparison | behind_scenes | news_update)
- imageStyle (cinematic | cartoon | anime_ghibli | pixar3d | ultra_realistic | editorial_dark | editorial_light | editorial_mix)
- cardCount (3 | 5 | 7)
- topic

## Output
1080×1350 PNGs in `out/carousels/{slug}/card-{n}.png` + caption.txt
