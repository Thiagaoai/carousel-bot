# /midia-full

Generate ALL platform variants from a single theme in one shot.

## Usage
```
/midia-full [company] [theme]
/midia-full dockplus-ai "Claude 4.7 has 1M context now"
```

## What it produces (one theme → 8 outputs)
1. Instagram carousel (5 cards)
2. Instagram Reel (30s)
3. YouTube Short (30s, SEO'd)
4. TikTok (21-34s, trending-sound suggested)
5. LinkedIn post
6. Twitter thread (8 tweets)
7. Facebook native video (reuse Reel)
8. Hashtag sets per platform

## Pipeline
1. Dispatch to **orchestrator**
2. orchestrator dispatches to each platform agent in parallel where possible
3. Skills: all (brand-presets, hook-writer, hashtag-researcher, content-repurposer, platform-specs, reflexion)
4. Budget check first — refuse if tier costs exceed remaining cap

## Output
`out/midia-full/{slug}-{ts}/` with every variant + master-schedule.md (staggered over 5 days)

## Budget estimate
Typical /midia-full run: $2-5 (carousel $0.25, reel $0.80, YT+TikTok reuse reel, LinkedIn $0.01 copy, Twitter $0.01, FB $0)
