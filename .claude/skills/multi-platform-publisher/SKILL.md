# Skill: multi-platform-publisher

## When to activate
`/publish [jobId] [platforms]` — broadcast to multiple platforms.
Auto-invoked after `/midia-full` or `/repurpose`.

## Purpose
Unified publishing layer over PostForMe + native APIs where available. One command → posts everywhere.

## Supported publishers
| Platform | Method | Credentials needed |
|---|---|---|
| Instagram (feed/reel/story) | PostForMe API | POSTFORME_API_KEY |
| Facebook (feed/reel) | PostForMe API | POSTFORME_API_KEY |
| Twitter/X | Twitter API v2 | TWITTER_BEARER_TOKEN |
| LinkedIn | LinkedIn API | LINKEDIN_ACCESS_TOKEN |
| TikTok | TikTok Business API | TIKTOK_ACCESS_TOKEN |
| YouTube Shorts | YouTube Data API v3 | YOUTUBE_CLIENT_ID + REFRESH_TOKEN |
| Threads | PostForMe (when supported) | POSTFORME_API_KEY |

## Process
1. Validate all required credentials present (report missing)
2. Run pre-flight: file exists, specs match platform, caption within limit
3. Publish in parallel with per-platform retry (2 attempts)
4. Log each result to Supabase `agente_dev.publications`
5. Return aggregated result

## Output
```json
{
  "jobId": "...",
  "results": [
    { "platform": "instagram", "status": "posted", "url": "https://...", "id": "..." },
    { "platform": "tiktok",    "status": "failed", "error": "auth expired" },
    { "platform": "linkedin",  "status": "posted", "url": "..." }
  ],
  "successRate": "2/3"
}
```

## Scheduling mode
When `schedule: [date]` is passed, queue to Supabase instead of immediate publish. A cron process picks up due jobs.

## Reflexion checks
- [ ] All files exist
- [ ] Specs match platform (re-use platform-specs skill)
- [ ] Captions within char limit
- [ ] Credentials valid (ping before upload for large files)
- [ ] Budget logged per post
