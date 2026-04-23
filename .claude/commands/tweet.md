# /tweet

Write a single Twitter/X tweet (≤280 chars).

## Usage
```
/tweet [company] [theme]
/tweet dockplus-ai "why no-code AI is a trap for serious SaaS"
```

## Pipeline
1. Dispatch to **twitter-agent**
2. Skills: hook-writer, copywriter-agent, brand-presets
3. Generates 5 variants, picks best by platform fit

## Output
`out/twitter/{slug}-{ts}.json` with the winning tweet + 4 alternatives
