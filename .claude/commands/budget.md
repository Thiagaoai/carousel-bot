# /budget

## Purpose
Display current month's video production budget dashboard with per-tier and per-company breakdown.

## When to invoke
- Checking remaining budget before production
- Monthly budget review
- When alerts trigger (80% or 90% thresholds)

## Input
- Month (optional): YYYY-MM format. Default: current month.

## Steps
1. Activate credit-budget-tracker skill
2. Query Supabase agente_dev.budget_log for target month
3. Calculate per-tier spending (HeyGen, fal.ai, Remotion)
4. Calculate per-company spending
5. Check alert thresholds (80%, 90%)
6. Generate optimization suggestions if budget is tight
7. Display ASCII dashboard

## Output
- Budget dashboard with spending breakdown
- Alert status (OK / WARNING / CRITICAL)
- Optimization suggestions (if applicable)
- Days remaining until month reset
