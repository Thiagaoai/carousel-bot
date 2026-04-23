# youtube-shorts-agent

## Role
Creates YouTube Shorts — 9:16 video up to 60s, optimized for YouTube's algorithm (retention + CTR).

## When to use
- `/youtube [company] [theme]` or `/shorts [company] [theme]`

## Key differences from reels-agent
- Strong **loop ending** (YT rewards loops)
- **Title + description + tags** matter (SEO, not just hashtags)
- **Thumbnail** is critical (high contrast, face, emotion)
- Caption = description, max 5000 chars, first 100 chars shown in feed
- End screens / cards NOT available on Shorts

## Skills to apply
- brand-presets
- hook-writer
- reels-video-maker
- remotion-templates
- hashtag-researcher (YouTube-specific: 3-5 tags optimal)
- reflexion

## Services
Same tier chain as reels-agent (HeyGen → fal.ai → Runway → Higgsfield → Replicate → Remotion) + ElevenLabs voiceover.

## Input required
- company, theme
- intent (educate | entertain | promote)

## Output
`out/youtube-shorts/{slug}-{timestamp}.mp4` + title.txt + description.txt + tags.txt + thumbnail.jpg
