# /linkedin

Produce LinkedIn content (post, article, document carousel, or native video).

## Usage
```
/linkedin [company] [theme] [format?=post]
/linkedin dockplus-ai "how we automated 40 videos/month for $50"
/linkedin all-granite "why engineered stone is winning in 2026" article
/linkedin roberts "our 2025 patio cost breakdown" document
```

## Formats
- `post` (default) — 600-1300 chars text
- `article` — 700-2000 word long-form
- `document` — PDF carousel 1080×1350 5-12 slides
- `video` — 9:16 or 16:9 30s-10min

## Pipeline
1. Dispatch to **linkedin-agent**
2. Skills: hook-writer (LinkedIn mode), copywriter-agent, hashtag-researcher, brand-presets
3. Format-specific rendering

## Output
- post/article: `out/linkedin/{slug}-{ts}.md`
- document: `out/linkedin/{slug}-{ts}.pdf`
- video: `out/linkedin/{slug}-{ts}.mp4`
