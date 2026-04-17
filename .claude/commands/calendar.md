# /calendar

## Purpose
Generate a weekly content calendar for all 5 companies with tier rotation, HeyGen scheduling, and seasonal themes.

## When to invoke
- Start of month planning
- Weekly production planning
- When user asks "what videos should we produce this week/month?"

## Input
- Month (optional): YYYY-MM format. Default: current month.
- Week (optional): 1-5. If specified, show only that week.

## Steps
1. Activate video-content-calendar skill
2. Determine season (spring/summer/fall/winter for Cape Cod)
3. Calculate HeyGen 5-week rotation position
4. Generate weekly breakdown:
   - 2 videos per company per week (10 total/week)
   - Balance tiers across weeks
   - Apply seasonal themes
5. Calculate monthly budget allocation
6. Output Markdown calendar

## Output
- Monthly calendar with weekly breakdown tables
- HeyGen rotation schedule
- Budget allocation per week
- Seasonal theme notes
