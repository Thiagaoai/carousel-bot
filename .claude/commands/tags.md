# /tags

Research and return hashtag strategy for a platform × theme.

## Usage
```
/tags [platform] [theme]
/tags instagram "patio installation cape cod"
/tags tiktok "AI automation small business"
```

## Pipeline
1. Dispatch to **hashtag-agent**
2. Skills: hashtag-researcher
3. Queries Perplexity for trending + pulls from brand pool

## Output (JSON)
```json
{
  "platform": "instagram",
  "primary": [...3 tags],
  "secondary": [...5 tags],
  "branded": [...1-2 tags],
  "trending": [...1-2 tags],
  "avoid": [...banned tags]
}
```
