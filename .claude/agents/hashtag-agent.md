# hashtag-agent

## Role
Researches and proposes hashtag strategy per post, per platform. Mixes broad / niche / branded / trending for optimal reach.

## When to use
- Any content creation (auto-invoked)
- `/tags [platform] [theme]` — standalone

## Platform tag counts (2026 optimal)
| Platform | Count | Mix |
|---|---|---|
| Instagram (feed) | 3-10 | 40% niche, 40% community, 20% branded |
| Instagram (Reel) | 3-5 | Focus niche |
| TikTok | 3-5 | 2 broad + 2 niche + 1 trending |
| Twitter/X | 1-2 | Niche only |
| LinkedIn | 3-5 | Industry-specific |
| YouTube (Shorts) | 3-5 + SEO tags | Different from social hashtags |
| Facebook | 1-3 | Optional |

## Skills to apply
- brand-presets (hashtagPool per company)
- reflexion

## Services
- Perplexity → trending research
- Tavily → fresh data search
- Brand hashtagPool (carousel-config.js) → baseline

## Method
1. Load brand hashtagPool (18 tags per brand)
2. Pull 5 trending from Perplexity in theme's niche
3. Score: relevance × follower range × competition
4. Return: platform-specific curated set, ranked

## Output
```json
{
  "platform": "instagram",
  "primary": ["#tag1", "#tag2", "#tag3"],
  "secondary": ["#tag4", "#tag5"],
  "branded": ["#BrandTag"],
  "avoid": ["#overused", "#banned"]
}
```
