# Video Content Calendar
# Category: Strategy | Planning
# Priority: 1

## Purpose
Generate weekly and monthly content calendars for 5 DockPlus businesses,
managing HeyGen rotation (5-week cycle), seasonal themes (Cape Cod climate),
and balanced tier distribution across companies.

## When to activate
- User runs `/calendar [month]`
- Start of new month planning
- User asks about content schedule, rotation, or upcoming videos

## Enhancement APIs

### Perplexity (Trend-Powered Theme Discovery)
```
API: PERPLEXITY_API_KEY
When: Before generating monthly calendar (Step 5 — Theme Bank Selection)
How:
  1. Query: "trending [industry] Instagram Reels content ideas [season] 2026 Cape Cod"
     Run for each of the 5 companies' industries
  2. Parse top 5 trending themes per company
  3. Merge with existing seasonal bank (Step 2)
  4. Prioritize trending themes over generic ones
Benefit: Calendar themes reflect real-time trends, not just static presets
```

### Firecrawl (Competitor Intelligence)
```
API: FIRECRAWL_API_KEY
When: Monthly planning (optional enrichment before Step 4)
How:
  1. Scrape competitor Instagram profiles (top 3 per company niche)
  2. Extract: most-engaged post types, hashtags, posting frequency
  3. Feed insights into theme selection and tier allocation
  4. Flag content gaps competitors are missing
Benefit: Data-driven content strategy, not guesswork
```

## Protocol

### Step 1: Determine Period
```
MONTH:    [requested or current]
YEAR:     [current]
WEEKS:    [count weeks in month]
SEASON:   spring (Mar-May) | summer (Jun-Aug) | fall (Sep-Nov) | winter (Dec-Feb)
```

### Step 2: Apply Seasonality (Cape Cod)
```
SPRING: Outdoor prep, cleaning, renovation start
  - Roberts: spring cleanup, mulching, patio prep
  - Cape Codder: deck repair, painting, window replacement
  - All Granite: outdoor kitchen countertops
  - Cheesebread: seasonal menu, outdoor seating
  - DockPlus AI: spring marketing push, new client onboarding

SUMMER: Peak season, showcase work, tourist traffic
  - Roberts: completed projects, landscape design, pools
  - Cape Codder: full renovations, summer specials
  - All Granite: kitchen remodels, showroom tours
  - Cheesebread: summer drinks, tourist specials, acai
  - DockPlus AI: case studies, ROI reports

FALL: Wrap-up, winterize, plan ahead
  - Roberts: fall cleanup, hardscape, snow prep
  - Cape Codder: winterization, insulation, heating
  - All Granite: indoor countertop season
  - Cheesebread: fall menu, pumpkin specials, cozy vibes
  - DockPlus AI: year planning, automation demos

WINTER: Indoor focus, planning, promotions
  - Roberts: design consultations, spring booking
  - Cape Codder: bathroom renos, basement finishing
  - All Granite: stone selection guides, design trends
  - Cheesebread: holiday catering, gift cards, warm drinks
  - DockPlus AI: new year packages, tech trends
```

### Step 3: HeyGen Rotation (5-week cycle)
Each company gets 1 HeyGen (Tier 1) video every 5 weeks:
```
Week 1: Roberts Landscape
Week 2: Cheesebread Bakery
Week 3: Cape Codder Home Improvement
Week 4: All Granite & Stone
Week 5: DockPlus AI Solutions
Week 6: Roberts Landscape (cycle restarts)
```
Cap: 2 HeyGen videos per month ($24 total).

### Step 4: Generate Weekly Plan
For each week, allocate 10 videos (2 per company):
```
WEEK [N] — [Date Range]
Company         | Video 1 (Type/Tier)           | Video 2 (Type/Tier)
----------------|-------------------------------|---------------------------
Roberts         | [type] / Tier [N] / $[cost]   | [type] / Tier 3 / $0
Cheesebread     | [type] / Tier [N] / $[cost]   | [type] / Tier 3 / $0
Cape Codder     | [type] / Tier [N] / $[cost]   | [type] / Tier 3 / $0
All Granite     | [type] / Tier [N] / $[cost]   | [type] / Tier 3 / $0
DockPlus AI     | [type] / Tier [N] / $[cost]   | [type] / Tier 3 / $0
                                          Week total: $[X]
```

Distribution target per month (40 videos):
- Tier 1 (HeyGen): 2 videos (5%)
- Tier 2 (fal.ai): 5 videos (12.5%)
- Tier 3 (Remotion): 33 videos (82.5%)

### Step 5: Theme Bank Selection
For each video slot, select theme from seasonal bank (Step 2).
Avoid repeating same theme within 2 weeks for same company.

### Step 6: Monthly Summary
```
CONTENT CALENDAR — [Month Year]
=================================
Total videos planned: 40
Budget allocation: $49.75
  HeyGen:  2 videos  ($24.00)
  fal.ai:  5 videos  ($20.00)
  Remotion: 33 videos ($0.00)
  Freepik:  assets   ($5.75)

HeyGen rotation this month:
  Week [N]: [Company A]
  Week [N]: [Company B]

Season: [SEASON] — themes adjusted accordingly
```

## Constraints
- Never schedule more than 2 HeyGen videos per month
- Never schedule more than 5 fal.ai videos per month (budget)
- Never repeat the same theme for the same company within 2 weeks
- Never ignore seasonality — Cape Cod seasons are distinct
- Always balance content types across companies (no company gets all promos)
- Output must be valid Markdown table format

## Output format
Full monthly calendar as Markdown with weekly breakdown tables,
monthly summary, and budget allocation.
