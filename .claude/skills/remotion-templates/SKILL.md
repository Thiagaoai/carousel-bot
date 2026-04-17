# Remotion Templates
# Category: Visual | Production
# Priority: 2

## Purpose
Manage and configure 5 Remotion video templates for Tier 3 production.
Each template is a React/TypeScript component rendering 9:16 Instagram Reels.

## When to activate
- reels-video-maker selects Tier 3 (Remotion)
- User asks to customize or create a Remotion template
- Any local video render request

## Protocol

### Step 1: Select Template
Match video type to template:

| Video Type | Template File | Duration | Best For |
|---|---|---|---|
| before-after | `before-after-reveal.tsx` | 30s | Transformations, renovations |
| service-showcase | `service-showcase.tsx` | 30s | Service highlights, portfolio |
| testimonial | `testimonial-quote.tsx` | 20s | Customer reviews, social proof |
| tips | `educational-tips.tsx` | 45s | How-to, educational, authority |
| promo | `promo-offer.tsx` | 15s | Discounts, seasonal offers, CTAs |

### Step 2: Populate Data Payload
Each template expects a props object:
```typescript
interface VideoProps {
  company: string;
  brand: {
    primary: string;    // hex
    secondary: string;  // hex
    accent: string;     // hex
    font: string;       // font family name
    logoUrl: string;    // path to logo
  };
  content: {
    headline: string;
    subheadline?: string;
    bodyTexts: string[];     // array of text blocks
    ctaText: string;
    images: string[];        // paths to images
  };
  config: {
    duration: number;        // seconds
    fps: 30;
    width: 1080;
    height: 1920;
  };
}
```

### Step 3: Render
```bash
# Local render command
cd remotion-templates/
npx remotion render src/index.ts [CompositionId] out/[company]-[type]-[date].mp4 \
  --props='{"company":"roberts","brand":{...},"content":{...}}'
```

Render specs:
- Resolution: 1080x1920 (9:16)
- Codec: H.264
- Bitrate: 5000 kbps
- FPS: 30
- Max file size: ~30 MB per 30s video

### Step 4: QA Check
After render:
1. Verify file exists in `out/`
2. Check file size (should be 15-35 MB for 15-45s)
3. Verify duration matches template spec
4. Take screenshot at 5s mark for visual QA

## Template Specs

### 1. Before-After Reveal (30s)
- Frame 0-5s: "Before" image full screen with label
- Frame 5-15s: Animated slider reveals "After" image
- Frame 15-25s: Side-by-side comparison with brand overlay
- Frame 25-30s: Logo + CTA + contact info

### 2. Service Showcase (30s)
- Frame 0-5s: Company name + tagline entrance animation
- Frame 5-20s: 4-panel grid, each panel slides in with service photo + icon + label
- Frame 20-25s: Full-width hero shot of best work
- Frame 25-30s: Logo + CTA

### 3. Testimonial Quote Card (20s)
- Frame 0-3s: Star rating animation (4-5 stars)
- Frame 3-15s: Quote text typewriter effect with customer avatar
- Frame 15-18s: Customer name + company fade in
- Frame 18-20s: Logo + "See more reviews" CTA

### 4. Educational Tips (45s)
- Frame 0-5s: "X Tips for [Topic]" title card
- Frame 5-15s: Tip 1 with icon + supporting image
- Frame 15-25s: Tip 2 with icon + supporting image
- Frame 25-35s: Tip 3 with icon + supporting image
- Frame 35-45s: "Want more?" + Logo + CTA + follow prompt

### 5. Promo/Offer (15s)
- Frame 0-3s: Attention-grabbing text pulse ("LIMITED TIME")
- Frame 3-8s: Offer details (discount %, service, value)
- Frame 8-12s: Countdown urgency element (optional)
- Frame 12-15s: CTA button animation + contact info

## Constraints
- Never render without brand-presets loaded (no default colors)
- Never exceed 1080x1920 resolution (Instagram Reels spec)
- Never output files larger than 50 MB
- Always use H.264 codec (Instagram compatibility)
- Always include logo in final 5 seconds of every template

## Output format
Rendered MP4 file path + render stats (duration, file size, codec).
