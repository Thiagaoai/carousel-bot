# Self-Healing
# Category: Dev | Resilience
# Priority: 2

## Purpose
Automatically detect, diagnose, and recover from common pipeline failures
(API timeouts, encoding errors, upload failures, rate limits) without
manual intervention.

## When to activate
- Any API call returns an error (PostForMe, fal.ai, HeyGen, Supabase)
- Encoding validation fails (broken UTF-8, emoji issues)
- File operations fail (render, upload, screenshot)
- deploy-specialist encounters a failure

## Protocol

### Step 1: Classify Error
```
TRANSIENT:   API timeout, rate limit, network blip → auto-retry
ENCODING:    UTF-8 failure, emoji break, charset issue → auto-fix
AUTH:        Token expired, 401/403 → alert user, suggest refresh
DATA:        Missing field, malformed input → trace back to source
FATAL:       Service down, quota exceeded → fallback tier
```

### Step 2: Auto-Recovery by Type

#### Transient Errors
```
Retry strategy: exponential backoff
  Attempt 1: wait 2s
  Attempt 2: wait 5s
  Attempt 3: wait 15s
  Max retries: 3
  On exhaust: classify as FATAL, trigger fallback
```

#### Encoding Errors
```
1. Detect broken characters in output
2. Force re-encode to UTF-8 (strip invalid bytes)
3. Re-validate emoji sequences
4. If caption: strip emoji, re-add from safe emoji set
5. Log pattern to Supabase memoria for future prevention
```

#### Auth Errors
```
1. Check .env for token presence
2. Check token expiry (if JWT)
3. Alert: "Token expired for [service]. Run: [refresh command]"
4. Do NOT auto-refresh tokens — security boundary
```

#### Data Errors
```
1. Trace missing field to input source
2. If optional field: use default value, log warning
3. If required field: halt and ask user
4. Never invent data to fill gaps
```

#### Fatal / Service Down
```
1. Identify which tier/service is affected
2. Activate fallback chain (try in order):

   fal.ai down or over budget:
     → FIRST: Replicate API (REPLICATE_API_TOKEN)
       Models: minimax/video-01-live or black-forest-labs/flux-1.1-pro
       Same prompt format, 9:16 aspect ratio
     → SECOND: Tier 3 Remotion (service-showcase with stock images)

   HeyGen down or over quota:
     → FIRST: DeepSeek script + Remotion testimonial-quote template
       (generate script via DEEPSEEK_API_KEY, render as text overlay)
     → SECOND: Tier 3 Remotion (testimonial-quote with text only)

   PostForMe down:
     → save MP4 locally to entregas/
     → queue for retry (max 3 attempts, exponential backoff)
     → alert user via delivery standard block

   Supabase down:
     → log to local file: entregas/offline-log.jsonl
     → sync to Supabase when connection restored

3. Notify user of fallback activation
4. Log fallback event to memoria
```

### Step 3: Log Incident
```sql
INSERT INTO memoria.memoria_temporaria_claude
  (agente, tipo, conteudo, created_at)
VALUES
  ('pipeline', 'error', '[error type]: [description] → [recovery action]', now());
```

## Constraints
- Never retry more than 3 times (prevent infinite loops)
- Never auto-refresh auth tokens (security boundary)
- Never invent data to fill missing fields
- Never suppress errors — always log and report
- Always activate tier fallback when primary service is down

## Output format
Single line: `HEALED: [error type] → [action taken] → [result]`
Or: `ESCALATED: [error type] → [reason] → requires manual action`
