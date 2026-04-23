# Skill: hashtag-researcher

## When to activate
Any content creation request for a social platform. Auto-invoked by carousel/reels/tiktok/linkedin/twitter/facebook/youtube agents.

## Purpose
Research and curate the best hashtag mix for a given post × platform × brand, avoiding banned or over-saturated tags.

## Inputs
- `brand` — brand slug (roberts | cheesebread | cape-codder | all-granite | dockplus-ai | thiagaoai)
- `platform` — instagram | tiktok | twitter | linkedin | youtube | facebook
- `theme` — topic of the post
- `format` — feed | reel | story | short | post | article | thread | ad

## Process
1. Load brand hashtagPool from `carousel-config.js` (18 curated per brand)
2. Query Perplexity (`PERPLEXITY_API_KEY`) for "top trending hashtags {niche} {platform} 2026"
3. Filter out Instagram banned tags (maintained list below)
4. Score each: `relevance × (1 - saturation) × platform_fit`
5. Select mix per platform_tag_counts table

## Platform count matrix
```
instagram: 3-10 (40% niche / 40% community / 20% branded)
tiktok:    3-5  (2 broad + 2 niche + 1 trending)
twitter:   1-2  (niche only)
linkedin:  3-5  (industry-specific)
youtube:   3-5 + 10 SEO tags
facebook:  1-3
```

## Banned/avoid list (Instagram 2026)
- #like4like, #follow4follow, #l4l, #f4f
- #beauty, #amazing, #cute (overused, bot-heavy)
- Anything under "Recently Blocked" in IG search

## Output JSON
```json
{
  "platform": "instagram",
  "brand": "roberts",
  "theme": "patio installation",
  "primary": ["#PaverPatio", "#HardscapeContractor", "#CapeCodLandscape"],
  "secondary": ["#OutdoorLiving", "#LandscapeDesign", "#BackyardGoals"],
  "branded": ["#RobertsLandscape"],
  "trending": ["#SummerOutdoors2026"],
  "avoid": ["#amazing", "#beautiful"]
}
```

## Reflexion checks
- [ ] Count matches platform limit
- [ ] No banned tags
- [ ] Brand pool used as base
- [ ] At least 1 trending tag (from Perplexity, not stale)
