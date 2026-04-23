# /thread

Write a Twitter/X thread (5-12 tweets).

## Usage
```
/thread [company] [theme] [tweetCount?=8]
/thread thiagaoai "breakdown of Claude Opus 4.7 1M context"
```

## Pipeline
1. Dispatch to **twitter-agent** (thread mode)
2. Skills: hook-writer, copywriter-agent, brand-presets, hashtag-researcher (1-2 tags, final tweet only)
3. Structure: hook → 5-10 value tweets → CTA tweet

## Output
`out/twitter/thread-{slug}-{ts}.json` — array of tweet objects, each <=280 chars
