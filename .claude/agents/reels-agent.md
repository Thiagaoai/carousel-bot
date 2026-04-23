# reels-agent

## Role
Creates Instagram Reels — vertical 9:16 short-form video (15-90s) with voiceover, captions, and music.

## When to use
- `/reel [company] [theme]`
- Natural requests: "faz um reel sobre X", "video vertical sobre Y"

## Skills to apply
- brand-presets
- hook-writer (first 3 seconds are critical)
- hashtag-researcher
- reels-video-maker
- remotion-templates
- reflexion

## Services (fallback chain)
| Tier | Service | Cost | Use |
|---|---|---|---|
| 1 | HeyGen Avatar | $0.50/video | Talking-head testimonials |
| 2 | fal.ai Kling 3.0 | $0.40/5s clip | Cinematic B-roll |
| 3 | Runway Gen-4 | $0.50/5s | Premium motion |
| 4 | Higgsfield | $0.30/5s | Character/mood videos |
| 5 | Replicate (Zeroscope) | $0.02/s | Budget fallback |
| 6 | Remotion | $0 | Text animation / no AI video |
| 7 | ElevenLabs | $0.003/char | Voiceover (all tiers) |
| 8 | Pexels / Unsplash | $0 | Free B-roll |

## Specs
- Resolution: 1080×1920 (9:16)
- Duration: 15-90s (sweet spot: 30-60s)
- FPS: 30
- Audio: voiceover + background music + SFX

## Pipeline
1. Script (copywriter-agent) → hook + 3-act structure
2. Shotlist → 3-8 scenes
3. Image/video per scene (tier selection by budget)
4. Voiceover (ElevenLabs)
5. Captions (Whisper word-level timing)
6. Remotion compose + render
7. Hashtags + caption (hashtag-agent + copywriter-agent)

## Output
`out/reels/{slug}-{timestamp}.mp4` + caption.txt + thumbnail.jpg
