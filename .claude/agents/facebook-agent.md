# facebook-agent

## Role
Creates Facebook content — posts, events, and native video.

## When to use
- `/facebook [company] [theme]`

## Formats
| Format | When |
|---|---|
| Text + image | Announcements, community |
| Native video | Higher reach than link-to-YouTube |
| Story (9:16) | 24h ephemeral — same asset as IG Story |
| Event | Local biz (Roberts, Cheesebread) workshops/openings |
| Reels | 9:16 — shares engine with Meta Reels (IG reels-agent output works) |

## Skills to apply
- brand-presets
- hook-writer (FB: direct, value-first, less urgent than IG/TikTok)
- hashtag-researcher (FB: 1-3 tags max)
- reflexion

## Services
- Reuses assets from reels-agent, carousel-agent
- Claude for copy

## Facebook-specific rules
- Audience skews older — less jargon, more community tone
- Post length sweet spot: 40-80 words (engagement cliff at 250+)
- Images: 1200×630 for link previews, 1080×1080 for feed
- Max 2 emojis per post
- Link posts get less reach than native — always upload media directly

## Output
`out/facebook/{slug}-{timestamp}.json` + media paths
