# Skill: content-repurposer

## When to activate
- `/repurpose [jobId]` — take existing asset and adapt to N other platforms
- `/midia-full [company] [theme]` — generate all formats for a single theme

## Purpose
Turn one source asset into N platform-native variants. One idea → maximum distribution.

## Repurposing matrix
| Source | Adaptable to |
|---|---|
| Carousel (10 cards) | Reel (card → scene), Thread (card → tweet), LinkedIn doc (direct), FB post (card 1 as image) |
| Reel (9:16 mp4) | TikTok (same file), YouTube Shorts (same), FB Reel (same), IG Story (same) |
| Tweet/Thread | LinkedIn post, IG quote card, Facebook post |
| LinkedIn article | Twitter thread (each section), Carousel (key points), Reel (top 3 insights) |
| Blog/news | All of the above |

## Adaptation rules
1. **Never just crop and repost.** Adapt tone, hook, hashtags per platform.
2. **Time-shift** — release staggered across 2-5 days (avoid cannibalism).
3. **Platform-native asset** — IG Story sticker ≠ TikTok text overlay.
4. **Different CTAs per platform** — LinkedIn ("thoughts?") vs TikTok ("follow for more").

## Process
1. Identify source format + content
2. Load target platforms
3. For each target:
   - Dispatch to platform agent (reels-agent, twitter-agent, etc.)
   - Pass source content as `context`
   - Agent adapts hook, copy, specs, hashtags
4. Return bundle with scheduling recommendation

## Output
```json
{
  "source": { "type": "carousel", "jobId": "..." },
  "variants": [
    { "platform": "instagram-reel", "file": "out/reels/...", "scheduled": "+0d" },
    { "platform": "tiktok",        "file": "out/tiktok/...", "scheduled": "+1d" },
    { "platform": "linkedin",      "file": "out/linkedin/...", "scheduled": "+2d" },
    { "platform": "twitter-thread","file": "out/twitter/...", "scheduled": "+3d" }
  ]
}
```

## Reflexion checks
- [ ] Each variant is platform-native, not just reformatted
- [ ] Hooks rewritten (not copy-pasted)
- [ ] Hashtags researched per platform
- [ ] Schedule staggered (no same-day multi-platform)
