# /deploy

## Purpose
Publish a finished video to Instagram via PostForMe API with encoding validation and error handling.

## When to invoke
- Video is rendered/generated and ready for Instagram
- User confirms video is approved for posting

## Input
- Video file path (MP4 in out/ or entregas/)
- Company slug (for correct Instagram account routing)
- Caption (from copy-specialist or user-provided)
- Schedule time (optional — immediate if omitted)

## Steps
1. Dispatch deploy-specialist agent
2. Validate MP4 encoding (H.264, UTF-8 caption, file size <50MB)
3. Validate caption encoding (no broken emojis — UTF-8 hardened)
4. Upload to PostForMe API:
   - Method: signed URL upload
   - Instagram Business ID: from .env
   - Media type: REELS
5. Confirm upload status
6. Log to Supabase agente_dev.videos (status: 'posted')
7. If failed: activate self-healing skill
8. If success: return Instagram post URL

## Output
- PostForMe upload confirmation
- Instagram post URL (after publishing delay)
- Delivery standard block
- Budget log update
