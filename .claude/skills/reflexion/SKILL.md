# Reflexion
# Category: Quality
# Priority: 0 (P0 — required before every delivery)

## Purpose
Self-review quality gate that runs before ANY delivery. Catches errors,
validates brand consistency, checks budget impact, and ensures production
standards before output reaches the user.

## When to activate
- MANDATORY before every delivery (non-negotiable)
- After video-producer generates output
- After copy-specialist delivers scripts/captions
- After deploy-specialist publishes content
- User runs `/reflexion` explicitly

## Protocol

### Step 1: Content Integrity Check
```
[ ] Output is complete (no placeholders, no TODO markers)
[ ] All required fields populated (no empty strings)
[ ] No broken file paths or dead references
[ ] Copy is spell-checked and grammatically correct
[ ] No AI-sounding phrases ("In today's world...", "leverage", "utilize")
```

### Step 2: Brand Consistency Check
```
[ ] Colors match company brand-preset (verify hex values)
[ ] Font matches company brand-preset
[ ] Tone of voice matches company profile
[ ] Logo present where required
[ ] No cross-contamination (wrong company's assets in output)
```

### Step 3: Technical Quality Check
```
[ ] Video specs correct (1080x1920, H.264, 30fps, <50MB)
[ ] Duration within template spec (+/- 2 seconds tolerance)
[ ] Encoding validated (UTF-8, no broken emojis)
[ ] File names follow convention: [company]-[type]-[YYYY-MM-DD].mp4
[ ] All API keys masked in output (no exposure)
```

### Step 4: Budget Validation
```
[ ] Budget was checked before production
[ ] Cost logged to credit-budget-tracker
[ ] Remaining budget is positive
[ ] No alert threshold crossed without acknowledgment
```

### Step 5: Delivery Standard
```
[ ] "DONE" section present and accurate
[ ] "TEST" section has actionable command or URL
[ ] "MISSING" section lists real gaps (not "nothing")
[ ] "NEXT" section has exactly one concrete next step
```

### Step 6: Verdict
```
IF all checks pass:
  "REFLEXION PASSED — Ready for delivery."
  
IF minor issues (1-2 non-critical):
  "REFLEXION WARNING — [list issues]. Delivering with notes."
  
IF critical issues:
  "REFLEXION BLOCKED — [list issues]. Fix before delivery."
  → Return to production step, do NOT deliver.
```

## Constraints
- Never skip reflexion — it is the final quality gate
- Never mark as PASSED if brand colors are wrong
- Never mark as PASSED if budget was not checked
- Never deliver with BLOCKED status
- Keep reflexion output under 10 lines (concise)

## Output format
Single-line verdict + checklist summary (collapsed by default, expandable).
