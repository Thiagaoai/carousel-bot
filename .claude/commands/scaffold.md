# /scaffold

## Purpose
Initialize a new company's video production workspace with brand assets, template configs, and directory structure.

## When to invoke
Adding a new company to the pipeline, or resetting a company's workspace.

## Input
- Company slug (roberts | cheesebread | cape-codder | all-granite | dockplus-ai)
- Or: new company name + brand colors + font + logo

## Steps
1. Create company directory under `assets/images/[slug]/`
2. Load brand-presets for company
3. Generate Remotion brand config in `remotion-templates/styles/[slug].ts`
4. Create company entry in Supabase `agente_dev.projetos` (if not exists)
5. Verify logo file exists at expected path
6. Take blank-state screenshot for reference

## Output
- Company workspace ready
- Brand config file created
- Supabase record created
- Ready for first `/produce` command
