# /facebook

Produce a Facebook post (text + image, or native video).

## Usage
```
/facebook [company] [theme] [format?=post]
/facebook cape-codder "kitchen remodel open house saturday" event
```

## Formats
- `post` (default) — text + 1 image 1200×1200
- `video` — native video, same 9:16 asset as IG Reel
- `event` — Facebook Event (for local brands)
- `reel` — reuse reels-agent output

## Pipeline
1. Dispatch to **facebook-agent**
2. Skills: hook-writer (FB mode — community-focused), copywriter-agent, hashtag-researcher (1-3 tags)

## Output
- `out/facebook/{slug}-{ts}.json` (post content)
- media assets reused from carousel/reels output
