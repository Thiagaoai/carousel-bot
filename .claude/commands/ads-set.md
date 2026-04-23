# /ads-set

Produce a full multivariate ad test matrix — 5 headlines × 5 hooks × 3 bodies × 3 CTAs × 3 creatives.

## Usage
```
/ads-set [platform] [company] [campaign_objective]
/ads-set meta roberts "lead generation for Cape Cod landscaping — $500 budget"
```

## Output volume
- 5 headlines
- 5 hook texts
- 3 body copies
- 3 CTAs
- 3 visual creatives
- = 225 possible combinations for A/B/n testing

## Pipeline
1. Dispatch to **ads-agent** (full matrix mode)
2. Skills: hook-writer (×5), copywriter-agent, brand-presets, reflexion
3. Creative generation via fal.ai + Canva MCP variants
4. Output structured for Meta Ads Manager CSV import

## Output
`out/ads/{platform}-{slug}-{ts}/`:
- creatives/creative-01.jpg ... creative-03.jpg
- copy.json (full matrix)
- campaign.csv (Meta Ads Manager importable)
- targeting.md
- budget-recommendation.md
- naming-convention.md (UTM + ad-set naming)
