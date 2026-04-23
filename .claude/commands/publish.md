# /publish

Broadcast a rendered asset to multiple platforms.

## Usage
```
/publish [jobId] [platforms]
/publish abc-123 instagram,facebook,linkedin,twitter
/publish abc-123 all                          # every supported platform
```

## Pipeline
1. Load job from storage
2. multi-platform-publisher skill validates specs + credentials
3. Parallel publish with 2× retry
4. Log each result to Supabase `agente_dev.publications`

## Supported platforms
instagram, facebook, twitter, linkedin, tiktok, youtube-shorts, threads

## Output
```json
{
  "jobId": "...",
  "results": [
    { "platform": "instagram", "status": "posted", "url": "..." }
  ],
  "successRate": "4/5"
}
```
