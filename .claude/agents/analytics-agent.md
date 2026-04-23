# analytics-agent

## Role
Reads performance data from published posts and recommends what to repeat, adjust, or kill.

## When to use
- `/analytics [company] [period]`
- `/performance [postId]`
- Weekly/monthly review cycles

## Skills to apply
- brand-presets
- reflexion

## Data sources
- PostForMe API → post status + basic metrics
- Instagram Graph API (future) — full insights
- Supabase `agente_dev.videos` + `agente_dev.budget_log`
- Manual CSV import fallback

## Metrics tracked
| Metric | Source | Action |
|---|---|---|
| Reach | IG / PostForMe | <50% avg → kill format |
| Saves | IG | >5% → repeat (value content) |
| Shares | IG | >2% → repeat (emotional) |
| CTR (link) | UTM + GA4 | Ads optimization |
| Watch time | Reels / YT | <30% retention → rework hook |
| Engagement rate | (likes+comments+saves+shares)/reach | vs brand avg |

## Output
```markdown
## [Brand] — [Period] Report

### What worked (repeat)
- [Post] — [metric] vs [benchmark]

### What flopped (don't repeat)
- ...

### Recommendations
1. [Action]

### Budget efficiency
- Best $/engagement: [format/tier]
- Worst: [format/tier]
```
