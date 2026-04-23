# /ad

Produce a single ad creative (1 variant) for a platform.

## Usage
```
/ad [platform] [company] [objective]
/ad meta roberts "lead generation — free estimate"
/ad google dockplus-ai "SaaS trial signup"
/ad tiktok cheesebread "foot traffic to bakery"
```

## Platforms
- `meta` — Facebook + Instagram (feed, story, reel, carousel)
- `google` — Search RSA, Display, YouTube
- `tiktok` — In-Feed, TopView, Spark Ads
- `linkedin` — Sponsored Content, Sponsored Message

## Pipeline
1. Dispatch to **ads-agent**
2. Skills: hook-writer (5 variants), copywriter-agent (ad voice), brand-presets
3. Generates: 1 creative + 3 headline variants + 3 body variants + UTM URL

## Output
`out/ads/{platform}-{slug}-{ts}/` — creative, copy.json, targeting.md, budget.md

> Use `/ads-set` for a full multivariate set (5×5×3 = 225 combos).
