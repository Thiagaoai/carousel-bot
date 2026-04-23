# /repurpose

Take one existing asset and adapt it to N other platforms.

## Usage
```
/repurpose [jobId] [target_platforms]
/repurpose abc-123 instagram-reel,tiktok,linkedin,twitter-thread
```

## Valid target platforms
- `instagram-carousel` (4:5 slides)
- `instagram-reel` (9:16 video)
- `instagram-story` (9:16 ephemeral)
- `tiktok`
- `youtube-shorts`
- `linkedin-post`
- `linkedin-document`
- `twitter-single`
- `twitter-thread`
- `facebook-post`
- `facebook-reel`

## Pipeline
1. Load source job from Supabase / `.tmp/jobs.json`
2. Dispatch to **content-repurposer** skill
3. For each target: route to specialist agent, pass context
4. Stagger schedule (max 1/day per platform to avoid cannibalism)

## Output
`out/repurpose/{sourceJobId}/` with subfolder per target platform + scheduling.md
