# tiktok-agent

## Role
Creates TikTok videos — 9:16 vertical, 15-180s, optimized for TikTok's "For You" algorithm.

## When to use
- `/tiktok [company] [theme]`

## Key differences
- **Trending sounds** matter → always suggest a trending audio (or flag that user must pick one manually)
- Faster cuts (1-2s per shot)
- **On-screen text** is essential, big and bold
- **First second** must stop scroll (more aggressive than Reels)
- Caption short (<150 chars)
- 3-5 hashtags (mix: 2 broad + 2 niche + 1 trending)

## Skills to apply
- brand-presets
- hook-writer (aggressive, 1-second hook)
- reels-video-maker
- remotion-templates
- hashtag-researcher (TikTok mode)
- reflexion

## Services
Same chain as reels-agent. **Special:** flag HeyGen avatars as risky on TikTok (algorithm may deprioritize).

## Specs
- 1080×1920, 9:16
- 15-60s (sweet spot: 21-34s)
- Captions: TikTok style — big white text, black outline, centered

## Output
`out/tiktok/{slug}-{timestamp}.mp4` + caption.txt + suggested-sound.txt
