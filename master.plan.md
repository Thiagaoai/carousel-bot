# MASTERPLAN — agente-sites
# System Design Document (SDD) — Project Creation Guide
# Version: 2.0 | Last updated: 2026-04-16
# Status: TEMPLATE — Replace all [PLACEHOLDERS] before use

---

## 1. PROJECT OVERVIEW

| Field | Value |
|-------|-------|
| **Project Name** | agente-sites |
| **Type** | Claude Code AI Development Agent Framework |
| **Purpose** | Autonomous agent system for building landing pages, dashboards, and digital products |
| **Owner** | [YOUR_EMAIL] |
| **Location** | `[YOUR_PATH]/agente-sites/` |
| **Git Remote** | [YOUR_GIT_REMOTE_URL] |

---

## 2. ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                        CLAUDE.md                            │
│                  (Master Agent Config)                       │
│           Identity · Rules · Delivery Standard              │
├──────────────────────┬──────────────────┬───────────────────┤
│      SKILLS (25)     │  SUB-AGENTS (5)  │  SLASH CMDS (7)  │
│   .claude/skills/    │ .claude/agents/  │ .claude/commands/ │
└──────────┬───────────┴────────┬─────────┴────────┬──────────┘
           │                    │                   │
           └────────────────────┼───────────────────┘
                                ▼
           ┌────────────────────────────────────────┐
           │           EXECUTION LAYER               │
           │   screenshot.js  ·  Playwright          │
           │   test-supabase  ·  Node.js             │
           └──────────────────┬─────────────────────┘
                              ▼
           ┌────────────────────────────────────────┐
           │          SUPABASE BACKEND               │
           │   Project: [YOUR_PROJECT_ID]            │
           │   Schema: agente_dev  (agent state)     │
           │   Schema: memoria     (agent memory)    │
           └──────────────────┬─────────────────────┘
                              ▼
           ┌────────────────────────────────────────┐
           │           DEPLOY TARGETS                │
           │   Vercel   — Next.js apps               │
           │   Netlify  — Static landing pages       │
           └────────────────────────────────────────┘
```

---

## 3. TECH STACK

| Layer | Technology | Usage |
|-------|-----------|-------|
| Frontend | HTML + Tailwind CSS | Landing pages, static sites |
| Frontend | React + Next.js 14 (App Router) | Dashboards, dynamic apps |
| Backend | Supabase (PostgreSQL) | Database, auth, real-time |
| Screenshots | Playwright + Chromium | Visual QA — 375px mobile + 1280px desktop |
| Deploy | Vercel | Next.js apps |
| Deploy | Netlify | Static landing pages |
| Runtime | Node.js 22+ LTS | Scripts, tooling |
| Package Manager | npm | Dependencies |

### package.json Dependencies
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "dotenv": "^16.x"
  },
  "devDependencies": {
    "playwright": "^1.x"
  }
}
```

---

## 4. FILE STRUCTURE

```
agente-sites/
├── .claude/
│   ├── agents/                         # Sub-agent definitions (5 files)
│   │   ├── landing-page-specialist.md
│   │   ├── copy-specialist.md
│   │   ├── dashboard-specialist.md
│   │   ├── crm-specialist.md
│   │   └── deploy-specialist.md
│   ├── commands/                        # Slash command definitions (7 files)
│   │   ├── scaffold.md
│   │   ├── deploy.md
│   │   ├── review-code.md
│   │   ├── new-client.md
│   │   ├── session-report.md
│   │   ├── audit.md
│   │   └── conteudo.md
│   ├── hooks/                           # Event hooks (configured separately)
│   ├── settings.json                    # Theme + global Claude Code settings
│   ├── settings.local.json              # Local machine permissions
│   └── skills/                          # 25 skill directories
│       ├── auto-plan/SKILL.md
│       ├── beautiful_prose/SKILL.md
│       ├── cost-reducer/SKILL.md
│       ├── create-skill/SKILL.md
│       ├── creative-director-skill/SKILL.md
│       ├── customer-support/SKILL.md
│       ├── deep-search/SKILL.md
│       ├── frontend-design/SKILL.md
│       ├── humanizer/SKILL.md
│       ├── kaizen/SKILL.md
│       ├── know-me/SKILL.md
│       ├── landing-page-advanced/SKILL.md
│       ├── reflexion/SKILL.md
│       ├── researcher/SKILL.md
│       ├── review-claudemd/SKILL.md
│       ├── security/SKILL.md
│       ├── self-healing/SKILL.md
│       ├── strategic-compact/SKILL.md
│       ├── subagent-driven-development/SKILL.md
│       ├── systematic-debugging/SKILL.md
│       ├── taste-skill/SKILL.md
│       ├── trigger-dev/SKILL.md
│       ├── ui-ux-pro-max-skill/SKILL.md
│       ├── visual-workflow/SKILL.md
│       └── web-design-guidelines/SKILL.md
├── entregas/                            # Screenshot output directory
├── node_modules/                        # Installed dependencies (gitignored)
├── .env                                 # Supabase credentials (gitignored)
├── .gitignore
├── CLAUDE.md                            # Master agent instructions
├── CONTEXT.md                           # Project context + IDs
├── MASTERPLAN.md                        # This document
├── MEMORY.md                            # Memory index
├── memoria.mentoria.md                  # Manual session log
├── package.json
├── package-lock.json
├── screenshot.js                        # Playwright screenshot utility
└── test-supabase.js                     # Supabase connection test
```

---

## 5. MASTER AGENT — CLAUDE.md

This is the root configuration file Claude Code reads on every session.

### Identity Block
```
You are an expert developer and creative director specializing in landing pages,
dashboards, and digital products. You build at production quality — output never
looks AI-generated or templated. You are fully autonomous.
```

### Critical Rules (non-negotiable)
1. ALWAYS dispatch `landing-page-specialist` sub-agent for all LP builds
2. ALWAYS run `/reflexion` before ANY delivery
3. NEVER deliver without Lighthouse scores (Performance ≥ 90, SEO ≥ 95)
4. NEVER deliver visual changes without screenshots (375px mobile + 1280px desktop)
5. NEVER use generic, templated, or AI-looking design
6. ALL chat output in [YOUR_LANGUAGE] (e.g. English / Portuguese)
7. ALL instruction files, skills, and briefs in English
8. Never ask for permission — execute and show BEFORE/AFTER
9. Never invent specifications — ask if critical data is missing

### Delivery Standard (every output must include)
1. **What was done** — concise summary
2. **How to test** — command or URL
3. **What is missing for production** — gaps list
4. **Recommended next step** — single action

### Token Economy Rules
- No reasoning or plans while coding — just code
- No narration — do it, then show the result
- Status updates: 1 line max
- Show results (screenshots, diffs), not process

### CLAUDE.md Template
```markdown
# [PROJECT_NAME] — Claude Code Agent

## Identity
[AGENT_IDENTITY_DESCRIPTION]

## Critical Rules
1. [RULE_1]
2. [RULE_2]
...

## Sub-Agent Dispatch
- Task type A → dispatch [sub-agent-name]
- Task type B → dispatch [sub-agent-name]
...

## Slash Commands
- /scaffold — [description]
- /deploy   — [description]
...

## Delivery Standard
Every output MUST include:
1. What was done
2. How to test
3. What is missing for production
4. Recommended next step

## Token Economy
- No reasoning while coding
- No narration
- Status updates: 1 line
- Show results not process
```

---

## 6. SUB-AGENTS (5)

Sub-agents are defined as individual Markdown files in `.claude/agents/`.
Each file gives the sub-agent its own identity, tools, and scope.

### Sub-Agent File Format
```markdown
# [Sub-Agent Name]

## Role
[One sentence describing this agent's specialty]

## When to use
[Trigger conditions — what tasks call this agent]

## Skills to apply
- [skill-name-1]
- [skill-name-2]

## Input required
- [What context must be passed when dispatching]

## Output format
- [What this agent must deliver]

## Constraints
- [What this agent must NOT do]
```

---

### 6.1 landing-page-specialist.md

```markdown
# landing-page-specialist

## Role
Specialist in building high-converting landing pages with production-quality UI,
CRO-optimized structure, and non-generic visual design.

## When to use
- Any request for a landing page, capture page, or sales page
- Any front-end interface build (static or dynamic)
- Any visual redesign or conversion rate optimization task

## Skills to apply
- frontend-design
- landing-page-advanced
- taste-skill
- ui-ux-pro-max-skill
- creative-director-skill

## Input required
- Client name and industry
- Target audience (pain point + goal)
- Primary CTA
- Brand kit (colors, fonts, logo) — or design from scratch
- Required sections list
- Copy brief OR raw copy to use

## Output format
1. HTML/Tailwind file (or Next.js component) — production-ready
2. Screenshots: 375px + 1280px (saved to entregas/)
3. Lighthouse scores (Performance, Accessibility, Best Practices, SEO)
4. Delivery standard block (what/how/missing/next)

## Constraints
- Never use generic hero stock photos without client approval
- Never ship without mobile screenshot
- Never use default Tailwind blue — always customize the palette
```

---

### 6.2 copy-specialist.md

```markdown
# copy-specialist

## Role
Specialist in persuasive, human-sounding copy for landing pages, ads,
email sequences, and social media — never generic, never AI-sounding.

## When to use
- Writing or rewriting headlines, CTAs, or full page copy
- Creating email sequences, ad copy, or social captions
- Any task where text is the primary deliverable

## Skills to apply
- humanizer
- beautiful_prose
- customer-support

## Input required
- Target audience and their primary pain
- Desired outcome after reading (click, sign up, call, buy)
- Brand voice (aggressive / warm / technical / casual)
- Competitor references (if available)
- Word count or section structure

## Output format
1. Structured copy block per page section
2. Headline variants (3 minimum)
3. CTA variants (3 minimum)
4. Tone notes for designer reference

## Constraints
- Never use filler phrases (e.g. "In today's fast-paced world...")
- Never use passive voice as default
- Never write copy without knowing the target audience pain point
```

---

### 6.3 dashboard-specialist.md

```markdown
# dashboard-specialist

## Role
Specialist in data visualization, real-time dashboards, chart UI,
and Supabase-connected dynamic interfaces.

## When to use
- Any dashboard, admin panel, or reporting interface
- Any feature requiring real-time data (Supabase subscriptions)
- Chart, graph, KPI card, or metrics UI requests

## Skills to apply
- frontend-design
- trigger-dev
- systematic-debugging

## Input required
- Data source (Supabase table/view name or API endpoint)
- Metrics to display (list of KPIs)
- User role (who sees this dashboard)
- Refresh rate (real-time / on-demand / scheduled)
- Preferred chart types

## Output format
1. Next.js dashboard component with Supabase client
2. Chart components (Recharts or Chart.js)
3. Real-time subscription setup (if required)
4. Screenshots + delivery standard block

## Constraints
- Never render charts without loading and empty states
- Never connect to database without RLS policies defined
- Always include error boundaries
```

---

### 6.4 crm-specialist.md

```markdown
# crm-specialist

## Role
Specialist in database schema design, Supabase RLS policies,
authentication flows, and data modeling for production apps.

## When to use
- Designing or refactoring a Supabase database schema
- Setting up auth (email/password, OAuth, magic link)
- Writing or auditing Row Level Security (RLS) policies
- Any task involving data integrity, migrations, or access control

## Skills to apply
- security
- systematic-debugging

## Input required
- Entity list (what data needs to be stored)
- User roles (e.g. admin, client, viewer)
- Access rules per role per table
- Existing schema (if refactoring)

## Output format
1. SQL migration files (versioned)
2. RLS policy statements
3. TypeScript types (Supabase gen types format)
4. Schema diagram (ASCII or Mermaid)
5. Delivery standard block

## Constraints
- Never create tables without RLS enabled
- Never expose service_role key in client-side code
- Always version migrations — never edit existing migration files
```

---

### 6.5 deploy-specialist.md

```markdown
# deploy-specialist

## Role
Specialist in deploying, optimizing, and maintaining production
environments on Vercel, Netlify, and Supabase.

## When to use
- Publishing a project to production or staging
- Domain setup, DNS configuration, or SSL
- Performance optimization (Lighthouse, Core Web Vitals)
- Rollback, incident response, or environment variable management

## Skills to apply
- self-healing
- cost-reducer
- systematic-debugging

## Input required
- Project type (Next.js / static HTML)
- Deploy target (Vercel / Netlify)
- Domain name (if custom)
- Environment variables list
- Build command and output directory

## Output format
1. Deploy URL (production + preview)
2. Lighthouse scores post-deploy
3. Environment variables checklist
4. Rollback procedure (if needed)
5. Delivery standard block

## Constraints
- Never deploy without running build locally first
- Never push .env files to git
- Always set up preview environments before merging to production
```

---

## 7. SLASH COMMANDS (7)

Slash commands are defined as Markdown files in `.claude/commands/`.
Each file describes what the command does and its expected output.

### Command File Format
```markdown
# /[command-name]

## Purpose
[One sentence — what this command does]

## When to invoke
[Trigger — when should this command be called]

## Input
[What data/context is needed to run this command]

## Steps
1. [Step 1]
2. [Step 2]
...

## Output
[What the command delivers]
```

---

### 7.1 /scaffold
```markdown
# /scaffold

## Purpose
Generate complete project boilerplate for a landing page, dashboard, or full app.

## When to invoke
Start of a new client project or new feature build.

## Input
- Project type: LP | Dashboard | Full App
- Client name and industry
- Tech stack (from supported list)
- Features list (minimum viable)

## Steps
1. Generate folder structure
2. Install dependencies
3. Create base files (layout, components, lib)
4. Set up Supabase connection (if applicable)
5. Configure deploy target (Vercel/Netlify)
6. Run screenshot.js to capture blank state

## Output
- Complete directory structure ready for development
- README with setup instructions
- First commit ready
```

---

### 7.2 /deploy
```markdown
# /deploy

## Purpose
Publish current project to Vercel or Netlify with full production checklist.

## When to invoke
Project is code-complete and ready for client delivery.

## Steps
1. Run build locally — confirm zero errors
2. Run Lighthouse audit — confirm scores
3. Check all environment variables
4. Deploy to preview URL
5. Run post-deploy screenshot (375px + 1280px)
6. If approved: promote to production
7. Confirm custom domain (if applicable)

## Output
- Production URL
- Preview URL
- Lighthouse scores
- Screenshot evidence
```

---

### 7.3 /review-code
```markdown
# /review-code

## Purpose
Full code quality review covering performance, security, accessibility, and maintainability.

## Steps
1. Scan for hardcoded secrets or sensitive data
2. Check component structure and reusability
3. Validate Tailwind class organization
4. Audit Supabase queries (N+1, missing indexes)
5. Check RLS policies
6. Validate TypeScript types (no `any`)
7. Run Lighthouse

## Output
- Issues list by severity (Critical / Warning / Suggestion)
- Specific file:line references
- Fix recommendations
```

---

### 7.4 /new-client
```markdown
# /new-client

## Purpose
Initialize a new client project with full structure, brand kit, and briefing.

## Steps
1. Collect: client name, industry, goals, CTA, brand colors, fonts
2. Create project directory under /clients/[client-slug]/
3. Run /scaffold for appropriate project type
4. Create client brief file
5. Save to Supabase agente_dev.projetos table
6. Return project summary

## Output
- Client project directory
- Brief document
- Supabase project record
```

---

### 7.5 /session-report
```markdown
# /session-report

## Purpose
Generate a structured summary of the current work session for memory and handoff.

## Steps
1. List all tasks completed this session
2. List all decisions made
3. List all pending items
4. Identify any new patterns or errors encountered
5. Save summary to memoria.mentoria.md
6. Update MEMORY.md index
7. Write record to Supabase memoria schema

## Output
- Session report block
- Updated MEMORY.md
- Supabase memory record
```

---

### 7.6 /audit
```markdown
# /audit

## Purpose
Run a full project audit covering Lighthouse, UX, security, and code quality.

## Steps
1. Run /review-code
2. Run Lighthouse (Performance, Accessibility, Best Practices, SEO)
3. Run ui-ux-pro-max-skill UX audit
4. Check for exposed secrets
5. Validate all RLS policies
6. Screenshot current state (375px + 1280px)
7. Compile full audit report

## Output
- Audit report with scores per category
- Issues ranked by priority (P1–P4)
- Screenshot evidence
- 30-day action plan
```

---

### 7.7 /conteudo
```markdown
# /conteudo

## Purpose
Run the full content generation workflow: research → copy → visual → publish.

## Steps
1. Define topic, audience, platform, and format
2. Dispatch copy-specialist for copy
3. Dispatch landing-page-specialist for visual (if applicable)
4. Review output with creative-director-skill gate
5. Prepare for publishing

## Output
- Final copy block
- Visual asset (screenshot or file)
- Publishing checklist
```

---

## 8. SKILLS — COMPLETE REFERENCE (25)

Skills are Markdown files in `.claude/skills/[name]/SKILL.md`.
They provide reusable instructions Claude Code applies during task execution.

### 8.1 Skills Requiring Content (fill in order of priority)

| Priority | Skill | Category | Status | Why it matters |
|----------|-------|----------|--------|----------------|
| P0 | `reflexion` | Quality | EMPTY | Required before every delivery |
| P0 | `landing-page-advanced` | Visual | EMPTY | Core product of this agent |
| P1 | `humanizer` | Copy | EMPTY | Used by copy-specialist |
| P1 | `beautiful_prose` | Copy | EMPTY | Used by copy-specialist |
| P1 | `security` | Quality | EMPTY | Used by crm-specialist |
| P1 | `self-healing` | Dev | EMPTY | Used by deploy-specialist |
| P2 | `web-design-guidelines` | Visual | EMPTY | Design system standards |
| P2 | `auto-plan` | Quality | EMPTY | Automatic planning |
| P2 | `researcher` | Research | EMPTY | Deep research methodology |
| P3 | `know-me` | Research | EMPTY | Client profiling |
| P3 | `deep-search` | Research | EMPTY | Comprehensive search |
| P3 | `visual-workflow` | Visual | EMPTY | Process diagrams |
| P3 | `review-claudemd` | Quality | EMPTY | CLAUDE.md auditing |
| P3 | `cost-reducer` | Quality | EMPTY | Token optimization |
| P3 | `create-skill` | Meta | EMPTY | Template for new skills |

### 8.2 Skills with Content (already filled)

| Skill | Category | Summary |
|-------|----------|---------|
| `frontend-design` | Visual | 8-step protocol: typography first → semantic HTML/Tailwind → color/depth → animation → surprise → responsive → accessible |
| `taste-skill` | Visual | Design calibration: Variance (1–4) × Motion (1–4) × Density (1–4). Presets: Corporate Safe (1/1/2) · Modern SaaS (2/2/2) · Premium Launch (3/3/1) |
| `creative-director-skill` | Visual | 5-phase: Briefing → Divergence → Convergence → Creative Direction → Gate. Evaluates emotional resonance, originality, differentiation |
| `ui-ux-pro-max-skill` | Visual | UX audit: Visual Hierarchy · Usability · Consistency · Accessibility. WCAG AA · 44px touch targets · 4/8px grid · semantic HTML |
| `subagent-driven-development` | Dev | 4-step orchestration: Identify → Pass context → Define completion → Review output |
| `trigger-dev` | Dev | Background jobs, retries, scheduled tasks. Compatible with Next.js · Node.js · Vercel · Supabase |
| `systematic-debugging` | Dev | 4 phases: COLLECT symptoms → HYPOTHESIZE → DIAGNOSE with evidence → FIX surgically. Never fix without confirmed root cause |
| `strategic-compact` | Quality | Context monitoring at 60% usage. Detects repetition, forgotten decisions, contradictions. Triggers /compact |
| `customer-support` | Strategy | Client communication templates: positive results (data-driven) · negative results (with action plan) · technical questions |
| `kaizen` | Strategy | 6-step improvement cycle: Observe → Analyze → Propose → Validate → Apply → Record. 1% per session. Records to Supabase |

### 8.3 Skill File Template

```markdown
# [Skill Name]
# Category: [Visual | Copy | Dev | Quality | Research | Strategy | Meta]
# Priority: [1–10]

## Purpose
[One sentence — what this skill does]

## When to activate
[Trigger conditions]

## Protocol

### Step 1: [Name]
[Instructions]

### Step 2: [Name]
[Instructions]

...

## Constraints
- [What this skill must NOT do]

## Output format
[What this skill produces]
```

---

## 9. TOOLS & UTILITIES

### screenshot.js
```javascript
// Usage: node screenshot.js <url> <filename.png> <width>
// Example (mobile):  node screenshot.js https://example.com mobile.png 375
// Example (desktop): node screenshot.js https://example.com desktop.png 1280
// Output: saves to entregas/

const { chromium } = require('playwright');

(async () => {
  const [, , url, filename, width] = process.argv;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: parseInt(width), height: 800 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `entregas/${filename}`, fullPage: true });
  await browser.close();
  console.log(`Screenshot saved: entregas/${filename}`);
})();
```

**Required viewports:** 375px (mobile) AND 1280px (desktop) — both mandatory.

### test-supabase.js
```javascript
// Usage: node test-supabase.js
// Tests connection to Supabase project using .env credentials

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

(async () => {
  const { data, error } = await supabase
    .from('memoria_temporaria_claude')
    .select('*')
    .limit(1);
  if (error) console.error('Connection failed:', error.message);
  else console.log('Connection OK:', data);
})();
```

---

## 10. SUPABASE BACKEND

### Environment Variables (.env)
```
SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]
SUPABASE_PROJECT_ID=[YOUR_PROJECT_ID]
```

> ⚠️ Never commit `.env` to git. Use `.env.example` with empty values for onboarding.

### Schema: `agente_dev` — Agent State

```sql
-- Run with service_role key

CREATE SCHEMA IF NOT EXISTS agente_dev;

CREATE TABLE agente_dev.projetos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  industry    TEXT,
  status      TEXT DEFAULT 'active',  -- active | paused | delivered
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE agente_dev.sessoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id  UUID REFERENCES agente_dev.projetos(id),
  agente      TEXT NOT NULL,           -- e.g. 'dev', 'copy', 'deploy'
  summary     TEXT,
  decisions   JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### Schema: `memoria` — Agent Memory

```sql
CREATE SCHEMA IF NOT EXISTS memoria;

CREATE TABLE memoria.memoria_temporaria_claude (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agente      TEXT NOT NULL,           -- e.g. 'dev'
  tipo        TEXT NOT NULL,           -- 'decision' | 'pattern' | 'error' | 'delivery'
  conteudo    TEXT NOT NULL,
  projeto_id  UUID REFERENCES agente_dev.projetos(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE memoria.memoria_permanente (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agente      TEXT NOT NULL,
  tipo        TEXT NOT NULL,
  conteudo    TEXT NOT NULL,
  tags        TEXT[],
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### Memory Write Triggers
Write to Supabase when ANY of these occur:
- A technical decision is made
- A site or feature is delivered
- A recurring error pattern is identified
- A client preference is confirmed

---

## 11. CONFIGURATION FILES

### .claude/settings.json
```json
{
  "theme": "dark-blue",
  "permissions": {
    "allow": [
      "Bash(node:*)",
      "Bash(npm:*)",
      "Edit(.claude/skills/**)",
      "Edit(entregas/**)",
      "Read(.env)"
    ]
  }
}
```

### .claude/settings.local.json
```json
{
  "permissions": {
    "allow": [
      "Edit(.claude/skills/**)"
    ]
  }
}
```

### .gitignore
```
.env
.env.local
node_modules/
entregas/*.png
entregas/*.jpg
.DS_Store
```

---

## 12. MEMORY SYSTEM

### Three-Layer Memory Architecture

| Layer | Storage | Purpose | When to write |
|-------|---------|---------|---------------|
| Session | `memoria.mentoria.md` | Manual session notes | End of every session |
| Indexed | `MEMORY.md` | Memory index / quick lookup | When new memory saved |
| Persistent | Supabase `memoria` schema | Cross-session structured memory | Technical decisions · patterns · deliveries |

### MEMORY.md Template
```markdown
# MEMORY INDEX

## Decisions
- [DATE] [DECISION] — [CONTEXT]

## Patterns
- [DATE] [PATTERN] — [IMPACT]

## Deliveries
- [DATE] [PROJECT] — [URL] — [SCORES]

## Known Errors
- [DATE] [ERROR] — [ROOT CAUSE] — [FIX]
```

### memoria.mentoria.md Template
```markdown
# Session [N] — [DATE]

## Tasks completed
- [TASK]

## Decisions made
- [DECISION]

## Pending
- [ITEM]

## Next session start point
- [FIRST ACTION]
```

---

## 13. FULL WORKFLOW

```
User Request
    │
    ▼
CLAUDE.md (Master Agent reads request)
    │
    ├─► Classify task type
    │
    ├─► Dispatch sub-agent (if applicable)
    │   ├── landing-page → landing-page-specialist
    │   ├── copy/text   → copy-specialist
    │   ├── dashboard   → dashboard-specialist
    │   ├── database    → crm-specialist
    │   └── deploy/ops  → deploy-specialist
    │
    ├─► Apply skills
    │   ├── taste-skill       → calibrate design dimensions
    │   ├── frontend-design   → build UI (8-step protocol)
    │   ├── systematic-debug  → fix bugs (4-phase)
    │   └── [other skills as needed]
    │
    ├─► Execute
    │   ├── Generate code (HTML/Tailwind or React/Next.js)
    │   ├── Take screenshots (375px + 1280px)
    │   └── Run Lighthouse audit
    │
    ├─► Quality Gate
    │   ├── /reflexion        → self-review before delivery
    │   ├── ui-ux-pro-max     → UX audit
    │   └── BEFORE/AFTER comparison
    │
    ├─► Deliver (standard block)
    │   ├── What was done
    │   ├── How to test
    │   ├── What is missing
    │   └── Next recommended step
    │
    └─► Save state to Supabase
        ├── agente_dev.sessoes → session log
        └── memoria.memoria_temporaria_claude → decisions/patterns
```

---

## 14. SETUP CHECKLIST — NEW PROJECT

Run this checklist when creating a new `agente-sites` instance:

### Phase 1 — Init (30 min)
- [ ] Create project directory: `mkdir agente-sites && cd agente-sites`
- [ ] Run `npm init -y`
- [ ] Install dependencies: `npm install @supabase/supabase-js dotenv`
- [ ] Install dev: `npm install -D playwright && npx playwright install chromium`
- [ ] Create `.env` with Supabase credentials
- [ ] Create `.gitignore`
- [ ] Create directory structure (`.claude/`, `entregas/`)
- [ ] Replace all [PLACEHOLDERS] in CLAUDE.md and CONTEXT.md
- [ ] Test Supabase connection: `node test-supabase.js`
- [ ] Test screenshot: `node screenshot.js https://google.com test.png 375`
- [ ] `git init && git add . && git commit -m "init: agente-sites foundation"`

### Phase 2 — Skills (1–2 sessions)
- [ ] Fill `reflexion` (P0 — required before first delivery)
- [ ] Fill `landing-page-advanced` (P0 — core product)
- [ ] Fill `humanizer` (P1)
- [ ] Fill `beautiful_prose` (P1)
- [ ] Fill `security` (P1)
- [ ] Fill `self-healing` (P1)
- [ ] Fill remaining 9 skills (P2–P3)
- [ ] Review and complete `ui-ux-pro-max-skill` (was cut off)

### Phase 3 — Agents & Commands (1 session)
- [ ] Create 5 sub-agent files in `.claude/agents/` (use templates from §6)
- [ ] Create 7 slash command files in `.claude/commands/` (use templates from §7)
- [ ] Configure hooks in `.claude/hooks/` (optional)

### Phase 4 — Database (1 session)
- [ ] Obtain Supabase `service_role` key
- [ ] Create `agente_dev` schema + tables (SQL from §10)
- [ ] Create `memoria` schema + tables (SQL from §10)
- [ ] Verify with `test-supabase.js`

### Phase 5 — Integration Test (1 session)
- [ ] Run full workflow end-to-end (request → sub-agent → delivery → screenshot)
- [ ] Verify Lighthouse scores (Performance ≥ 90, SEO ≥ 95)
- [ ] Verify Supabase memory write after delivery
- [ ] First real client LP build
- [ ] Validate delivery standard output

---

## 15. PRIORITY ROADMAP

### Session 1 — Foundation
1. Replace all placeholders
2. Get Supabase `service_role` key
3. Create schemas + tables
4. Git init + first commit

### Sessions 2–3 — Skills
5. Fill P0 skills first: `reflexion`, `landing-page-advanced`
6. Fill P1 skills: `humanizer`, `beautiful_prose`, `security`, `self-healing`
7. Fill remaining P2–P3 skills

### Sessions 4–5 — Agents & Commands
8. Create all 5 sub-agent files (templates in §6)
9. Create all 7 slash command files (templates in §7)
10. Configure hooks

### Session 6 — First Real Build
11. Run full workflow test
12. Build first client landing page
13. Validate entire delivery pipeline

---

## 16. KNOWN ISSUES & FIXES

| Issue | Cause | Fix |
|-------|-------|-----|
| `test-supabase.js` fails on table query | Table not yet created | Create `memoria` schema first using service_role key |
| MCP Supabase connects to wrong project | Gmail OAuth connects to carousel-bot project | Use `.env` direct connection, not MCP, for this project |
| `ui-ux-pro-max-skill` content incomplete | Was cut off during initial setup | Rewrite from template (§8.3) |

---

## 17. QUICK REFERENCE

| What | Where |
|------|-------|
| Master config | `CLAUDE.md` |
| Project context + IDs | `CONTEXT.md` |
| All 25 skills | `.claude/skills/[name]/SKILL.md` |
| Sub-agents (5) | `.claude/agents/[name].md` |
| Slash commands (7) | `.claude/commands/[name].md` |
| Screenshot utility | `screenshot.js` |
| Screenshot output | `entregas/` |
| Supabase test | `test-supabase.js` |
| Environment vars | `.env` |
| Session notes | `memoria.mentoria.md` |
| Memory index | `MEMORY.md` |
| This document | `MASTERPLAN.md` |

---

## 18. PLACEHOLDERS INDEX

All values that MUST be replaced before using this as a live project:

| Placeholder | Replace with |
|-------------|--------------|
| `[YOUR_EMAIL]` | Project owner email |
| `[YOUR_PATH]` | Local filesystem path |
| `[YOUR_GIT_REMOTE_URL]` | GitHub/GitLab remote URL |
| `[YOUR_PROJECT_ID]` | Supabase project ID |
| `[YOUR_ANON_KEY]` | Supabase anon key |
| `[YOUR_SERVICE_ROLE_KEY]` | Supabase service role key |
| `[YOUR_LANGUAGE]` | Primary language for agent chat output |
| `[PROJECT_NAME]` | Name used in CLAUDE.md header |
| `[AGENT_IDENTITY_DESCRIPTION]` | Agent role description in CLAUDE.md |
| `[NOME DA SUA EMPRESA]` | Company name (any remaining references) |

---

*MASTERPLAN v2.0 — Neutral template · Replace all placeholders before use*
*Framework: agente-sites · Architecture: Claude Code + Supabase + Vercel/Netlify*