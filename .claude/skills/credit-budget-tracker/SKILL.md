# Credit Budget Tracker
# Category: Quality | Finance
# Priority: 1

## Purpose
Track and manage the $200/month video production budget across 3 tiers
(HeyGen $24, fal.ai $20, Remotion $0, Freepik $5.75), providing real-time
balance checks, alerts at thresholds, and cost optimization suggestions.

## When to activate
- Before any video production (mandatory budget check)
- User runs `/budget`
- User asks about costs, spending, or remaining budget
- Monthly reset (1st of each month)

## Protocol

### Step 1: Load Current State
Read from Supabase `agente_dev.budget_log` for current month:
```sql
SELECT tier, SUM(custo) as total
FROM agente_dev.budget_log
WHERE mes = '[YYYY-MM]'
GROUP BY tier;
```

### Step 2: Calculate Dashboard
```
MONTHLY_CAP:      $200.00
FIXED_COSTS:      $49.75 (HeyGen $24 + fal.ai $20 + Freepik $5.75)
VARIABLE_SPENT:   [from query — additional fal.ai/HeyGen beyond base]
TOTAL_SPENT:      FIXED_COSTS + VARIABLE_SPENT
REMAINING:        MONTHLY_CAP - TOTAL_SPENT
UTILIZATION:      (TOTAL_SPENT / MONTHLY_CAP) * 100

Per-tier breakdown:
  HeyGen:   $[X] / $24 cap   ([N] videos)
  fal.ai:   $[X] / $20 cap   ([N] videos)
  Remotion:  $0              ([N] videos)
  Freepik:  $5.75            (unlimited)
  
Per-company breakdown:
  Roberts:     $[X] ([N] videos)
  Cheesebread: $[X] ([N] videos)
  Cape Codder: $[X] ([N] videos)
  All Granite: $[X] ([N] videos)
  DockPlus AI: $[X] ([N] videos)
```

### Step 3: Alert Check
```
IF utilization >= 90%:
  ALERT: "CRITICAL — 90% budget used. $[remaining] left. Force Tier 3 only."
ELIF utilization >= 80%:
  ALERT: "WARNING — 80% budget used. $[remaining] left. Consider Tier 3 for next productions."
ELIF utilization >= 60%:
  INFO: "On track. $[remaining] left for [days_remaining] days."
ELSE:
  OK: "Healthy. $[remaining] available."
```

### Step 4: Optimization Suggestions (when budget tight)
```
IF remaining < $30:
  SUGGEST:
  - "Switch to Remotion-only (Tier 3) for remaining videos — $0 cost"
  - "Skip HeyGen this week — save $12 per video"
  - "Reduce fal.ai batch from 5 to 3 — save $5.22"
  
IF remaining < $10:
  SUGGEST:
  - "Tier 3 only until month reset on [date]"
  - "Postpone premium content to next month"
```

### Step 5: Log Transaction (when called by reels-video-maker)
```sql
INSERT INTO agente_dev.budget_log (mes, tier, custo, video_id)
VALUES ('[YYYY-MM]', [tier], [cost], [video_uuid]);
```

### Step 6: Output Dashboard
```
BUDGET DASHBOARD — [Month Year]
================================
Total:     $[spent] / $200.00 ([utilization]%)
Remaining: $[remaining]
Reset:     [1st of next month]

Tier 1 (HeyGen):  $[X] — [N]/2 videos used
Tier 2 (fal.ai):  $[X] — [N]/5 videos used
Tier 3 (Remotion): $0  — [N] videos (unlimited)

[ALERT or OK message]
[Optimization suggestions if applicable]
```

## Constraints
- Never allow production if it would exceed $200 hard cap
- Never skip budget check before video production
- Always show per-company breakdown when dashboard is requested
- Always include days remaining until month reset
- Log every transaction to Supabase — no exceptions

## Output format
ASCII dashboard block as shown in Step 6.
When called as a check (not full dashboard), return single line:
`Budget: $[remaining] remaining ([utilization]%) — [OK/WARNING/CRITICAL]`
