# Systematic Debugging
# Category: Dev | Quality
# Priority: 2

## Purpose
4-phase debugging protocol for diagnosing pipeline failures with evidence-based
root cause analysis. Never fix without confirmed diagnosis.

## When to activate
- Any bug or unexpected behavior in the video pipeline
- Render failures, API integration issues, data inconsistencies
- When self-healing escalates an issue as unresolvable
- User reports a problem or regression

## Protocol

### Phase 1: COLLECT Symptoms
```
1. What happened? (exact error message, status code, output)
2. What was expected? (correct behavior)
3. When did it start? (first occurrence, frequency)
4. What changed? (recent code changes, config updates, API changes)
5. Scope? (one company, one tier, all, specific template)
```
Capture ALL symptoms before proceeding. Do not skip.

### Phase 2: HYPOTHESIZE
Generate ranked hypotheses (most likely first):
```
H1: [hypothesis] — Evidence: [what supports this]
H2: [hypothesis] — Evidence: [what supports this]
H3: [hypothesis] — Evidence: [what supports this]
```
Max 3 hypotheses. If more than 3, you need more data (return to Phase 1).

### Phase 3: DIAGNOSE with Evidence
Test each hypothesis with minimal, targeted checks:
```
H1 test: [specific command or check] → Result: [confirmed/rejected]
H2 test: [specific command or check] → Result: [confirmed/rejected]
```
Stop at first confirmed hypothesis. If all rejected, collect more symptoms.

Diagnostic tools:
- Supabase logs: `SELECT * FROM agente_dev.videos WHERE status='failed' ORDER BY created_at DESC LIMIT 5`
- API status: curl endpoint health checks
- File integrity: check file size, encoding, format
- Render logs: check Remotion stdout/stderr
- Environment: verify .env values present and valid

### Phase 4: FIX Surgically
```
ROOT CAUSE: [confirmed hypothesis with evidence]
FIX: [minimal change that addresses root cause]
VERIFY: [how to confirm fix works]
PREVENT: [what to add to prevent recurrence]
```

Rules:
- Fix ONLY the root cause — no drive-by refactoring
- Test the fix in isolation before applying broadly
- Log the fix pattern to Supabase memoria for learning

## Constraints
- NEVER fix without Phase 3 confirmation (no guessing)
- NEVER apply broad fixes for narrow problems
- NEVER skip Phase 1 symptoms collection
- Maximum 3 hypotheses per cycle — if stuck, collect more data
- Always log resolved bugs to memoria for pattern detection

## Output format
```
BUG: [one-line description]
ROOT CAUSE: [confirmed cause]
FIX: [what was changed]
VERIFY: [how to test]
PREVENT: [future prevention measure]
```
