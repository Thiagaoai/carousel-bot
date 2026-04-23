# /youtube

Produce a YouTube Short (9:16, ≤60s) optimized for SEO + loop retention.

## Usage
```
/youtube [company] [theme] [intent?=educate]
/youtube dockplus-ai "3 Claude prompts that replaced my copywriter"
```

## Intents
- `educate` — tutorial, explainer
- `entertain` — story, reaction
- `promote` — product showcase, testimonial

## Pipeline
1. Dispatch to **youtube-shorts-agent**
2. Skills: hook-writer, reels-video-maker, remotion-templates, hashtag-researcher (YouTube mode)
3. Generates title + description + tags (SEO optimized) + high-contrast thumbnail

## Output
- `out/youtube-shorts/{slug}-{ts}.mp4`
- `out/youtube-shorts/{slug}-{ts}-title.txt`
- `out/youtube-shorts/{slug}-{ts}-description.txt`
- `out/youtube-shorts/{slug}-{ts}-tags.txt`
- `out/youtube-shorts/{slug}-{ts}-thumb.jpg`
