# Skill: hook-writer

## When to activate
Every content creation. The hook is the first sentence/frame/card — determines whether the scroll stops.

## Purpose
Write 5 hook variants per post, scored by platform × intent. Let the user or analytics-agent pick the winner.

## Inputs
- `platform` — instagram | tiktok | twitter | linkedin | youtube | facebook | ads
- `intent` — educate | entertain | promote | inspire | contrarian
- `theme` — topic
- `brand_voice` — from brand-presets

## Frameworks (pick 1 per variant)
1. **Pain → Promise** — "Tired of X? Here's how to Y."
2. **Stat shock** — "94% of X fail at Y. Here's why."
3. **Contrarian** — "Everything you heard about X is wrong."
4. **Curiosity gap** — "The 3-word phrase that closed my biggest deal."
5. **Story cold-open** — "Last Tuesday, a client called me crying. Here's what happened."
6. **Direct benefit** — "Save 10 hours/week with this prompt."
7. **Question that flips** — "What if the thing you're avoiding is the answer?"

## Platform rules
| Platform | Hook rules |
|---|---|
| TikTok | <1 second — visual + first word shock. Never start with "hey guys" |
| Reels | <3 seconds — stop the scroll. Text overlay in first frame |
| YouTube Shorts | Retention-focused — tease the payoff in first 2s |
| Instagram carousel | Card 1 = entire hook, 5-8 words max, huge type |
| LinkedIn | First 1 line (before "see more") must create tension |
| Twitter | Full 280 chars can be the hook, but thread opener should force RT |
| Ads | Pain or desire, test all 7 frameworks in variants |

## Brand voice layer
Load from brand-presets. Apply tone modifier:
- Roberts → local authority, outdoor-focused
- Cheesebread → warm, food-sensory
- Cape Codder HI → practical, trust
- All Granite → premium, design-first
- DockPlus AI → bold, technical speed
- ThiagaoAI → clear, factual, simple

## Output
```json
{
  "hooks": [
    {"framework": "contrarian", "text": "..."},
    {"framework": "stat_shock", "text": "..."},
    {"framework": "story", "text": "..."},
    {"framework": "curiosity", "text": "..."},
    {"framework": "benefit", "text": "..."}
  ],
  "recommended_index": 0,
  "reasoning": "contrarian fits [brand] tone + [platform] algorithm"
}
```

## Reflexion checks
- [ ] 5 variants, distinct frameworks
- [ ] Within platform character/second budget
- [ ] Matches brand tone
- [ ] No clichés ("here's the thing", "let me tell you", "buckle up")
