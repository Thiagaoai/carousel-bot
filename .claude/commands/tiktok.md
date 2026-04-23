# /tiktok

Produce a TikTok video (9:16, 15-180s) with aggressive hook and on-screen text.

## Usage
```
/tiktok [company] [theme]
/tiktok cheesebread "ASMR pao de queijo fresh from oven"
```

## Pipeline
1. Dispatch to **tiktok-agent**
2. Skills: hook-writer (TikTok mode — 1s stop-scroll), reels-video-maker, remotion-templates, hashtag-researcher (3-5 tags, trending-heavy)
3. TikTok-specific: big text overlay, fast cuts, trending-sound suggestion

## Output
- `out/tiktok/{slug}-{ts}.mp4`
- `out/tiktok/{slug}-{ts}-caption.txt`
- `out/tiktok/{slug}-{ts}-sound-suggestion.txt`
