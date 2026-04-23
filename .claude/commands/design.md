# /design

Create static visual assets (banner, logo, thumbnail, flyer, business card, profile pic).

## Usage
```
/design [type] [company] [prompt]
/design banner dockplus-ai "cyberpunk AI brand banner for LinkedIn"
/design thumbnail roberts "dramatic before/after patio split screen"
/design business-card all-granite "premium marble texture with gold accent"
```

## Types
- `banner` — cover for social profiles (platform auto-detected from prompt)
- `logo` — brand mark
- `thumbnail` — YouTube/blog thumbnail 1280×720
- `header` — email or web header
- `flyer` — print or digital flyer
- `business-card` — 3.5×2 in @ 300dpi
- `profile-pic` — 320×320 or 400×400

## Pipeline
1. Dispatch to **design-agent**
2. Skills: brand-presets, platform-specs, reflexion
3. Service chain: Canva MCP → Figma MCP → Claude Design → fal.ai FLUX → Replicate

## Output
`out/design/{type}-{slug}-{ts}.png` + source reference (Canva URL / Figma node ID)
