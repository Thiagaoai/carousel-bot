# /analytics

Pull performance data and generate a what-worked-what-didn't report.

## Usage
```
/analytics [company] [period?=7d]
/analytics dockplus-ai 30d
/analytics roberts last-month
```

## Periods
- `7d` — last 7 days
- `30d` — last 30 days
- `last-month` — full previous month
- `ytd` — year to date

## Pipeline
1. Dispatch to **analytics-agent**
2. Data: PostForMe API + Supabase `agente_dev.videos` + `agente_dev.budget_log`
3. Skills: reflexion

## Output
`out/analytics/{slug}-{period}.md` — markdown report with:
- What worked (top 3 by saves/shares)
- What flopped (bottom 3 by reach)
- Recommendations (specific format/tier actions)
- Budget efficiency (best $/engagement)
