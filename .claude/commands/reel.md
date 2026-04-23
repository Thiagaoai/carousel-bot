# /reel

Produce an Instagram Reel (9:16, 15-90s) with voiceover + captions + music.

## Usage
```
/reel [company] [theme]
/reel roberts "patio transformation before after"
/reel thiagaoai "GPT-5 just dropped"
```

## Pipeline
1. Dispatch to **reels-agent**
2. Skills: hook-writer, reels-video-maker, remotion-templates, hashtag-researcher, brand-presets
3. Services (auto tier): HeyGen → fal.ai Kling → Runway → Higgsfield → Replicate → Remotion
4. Voiceover via ElevenLabs (multilingual v2)
5. Captions: Whisper word-level timing
6. /reflexion quality gate

## Output
- `out/reels/{slug}-{ts}.mp4`
- `out/reels/{slug}-{ts}-caption.txt`
- `out/reels/{slug}-{ts}-thumb.jpg`
