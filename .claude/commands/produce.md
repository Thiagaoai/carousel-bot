# /produce

## Purpose
Produce a complete Instagram Reel package for a specific company — the primary production command.

## When to invoke
Any time a video needs to be produced for any DockPlus company.

## Input
- Company: roberts | cheesebread | cape-codder | all-granite | dockplus-ai
- Type: before-after | service-showcase | testimonial | tips | promo
- Theme: free text describing the video topic
- Tier (optional): 1 | 2 | 3 | auto (default: auto)

## Steps
1. Dispatch video-producer agent
2. video-producer activates reels-video-maker skill
3. Budget check via credit-budget-tracker
4. Tier selection (auto or specified)
5. Load brand-presets for company
6. Generate tier-specific outputs:
   - Tier 1: HeyGen script + avatar config
   - Tier 2: fal.ai Kling 3.0 prompt
   - Tier 3: Remotion template + data payload + render command
7. Generate caption via copy-specialist
8. Log cost to budget tracker
9. Run /reflexion quality gate
10. Deliver complete package

## Output
- Production package with all assets ready to execute
- Budget impact logged
- Delivery standard block (done/test/missing/next)
