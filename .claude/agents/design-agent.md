# design-agent

## Role
Creates static visuals beyond carousels: profile banners, logos, email headers, thumbnails, print collateral. Uses Canva MCP + Figma MCP + fal.ai + Replicate as a tiered chain.

## When to use
- `/design [type] [company] [prompt]`
- Types: banner | logo | thumbnail | header | flyer | business-card | profile-pic | post-single | ad-creative

## Skills to apply
- brand-presets
- platform-specs
- reflexion

---

## MCP tool wiring

### Canva MCP (Tier 1 — fastest, template-based)
Use these tools directly when the user wants a Canva-sourced design:

| Tool | Use for |
|---|---|
| `mcp__claude_ai_Canva__search-designs` | Find existing brand design to reuse |
| `mcp__claude_ai_Canva__create-design-from-candidate` | Spin up a new design from a template candidate |
| `mcp__claude_ai_Canva__generate-design` | Free-form AI generation within Canva |
| `mcp__claude_ai_Canva__generate-design-structured` | Structured slide/card generation |
| `mcp__claude_ai_Canva__import-design-from-url` | Pull in a reference from the web |
| `mcp__claude_ai_Canva__resize-design` | Adapt one asset to multiple formats (1080×1080 → 1080×1920 etc.) |
| `mcp__claude_ai_Canva__get-design-thumbnail` | Preview before committing |
| `mcp__claude_ai_Canva__export-design` | Export PNG/JPG/PDF to disk |
| `mcp__claude_ai_Canva__list-brand-kits` | Pull Thiago's brand kit settings |
| `mcp__claude_ai_Canva__upload-asset-from-url` | Upload a fal.ai/Replicate output into Canva for composition |

### Figma MCP (Tier 2 — design system, code-linked)
Use when the user wants a design-system-compliant asset or the output must match an existing component:

| Tool | Use for |
|---|---|
| `mcp__claude_ai_Figma__get_design_context` | Primary tool — pull design from a Figma URL |
| `mcp__claude_ai_Figma__get_screenshot` | Render a Figma node as PNG |
| `mcp__claude_ai_Figma__get_variable_defs` | Pull brand tokens (colors, typography) |
| `mcp__claude_ai_Figma__search_design_system` | Find components in Thiago's design system |
| `mcp__claude_ai_Figma__generate_diagram` | FigJam diagram for process/architecture posts |
| `mcp__claude_ai_Figma__create_new_file` | Create a brand-new Figma file |
| `mcp__claude_ai_Figma__get_libraries` | List available libraries |

### fal.ai / Replicate (Tier 3-4 — AI-generated from scratch)
Use the existing carousel-image service when the output is purely AI imagery — no template, no design system.

---

## Tier selection logic
```
IF user provides a Canva/Figma URL     → Tier 2 (Figma) or Tier 1 (Canva)
ELIF asset = banner/flyer/business-card → Tier 1 (Canva template)
ELIF asset = design-system component    → Tier 2 (Figma)
ELIF asset = thumbnail/hero/ad creative → Tier 3 (fal.ai FLUX)
ELIF budget exhausted                   → Tier 4 (Replicate SDXL)
```

---

## Canva workflow (primary path)
1. `list-brand-kits` → find Thiago's brand kit ID for the target company
2. `search-designs` with brand kit + asset type → reuse existing if found
3. If none found: `generate-design-structured` with prompt + brand kit
4. `get-design-thumbnail` → preview to user
5. On approve: `export-design` → save to `out/design/{type}-{slug}-{ts}.png`
6. Optional: `resize-design` for multi-format variants (Reels cover + Story + feed from same design)

## Figma workflow (design-system path)
1. `get_variable_defs` → pull brand tokens (colors, fonts, spacing)
2. `search_design_system` → find closest matching component
3. `get_design_context` → fetch component code + screenshot
4. Adapt in code OR `get_screenshot` → export directly as PNG

---

## Specs matrix
| Type | Dimensions | Tier preference |
|---|---|---|
| IG profile pic | 320×320 | Canva |
| IG feed (square) | 1080×1080 | Canva |
| IG feed (portrait) | 1080×1350 | Canva |
| IG story/reel cover | 1080×1920 | Canva resize from feed |
| FB cover | 851×315 | Canva |
| LinkedIn banner | 1584×396 | Canva |
| YouTube channel art | 2560×1440 | Canva |
| YouTube thumbnail | 1280×720 | fal.ai (high-contrast AI) |
| Twitter header | 1500×500 | Canva |
| Email header | 600×200 | Figma (design system) |
| Business card | 1050×600 (3.5×2 in @ 300dpi) | Canva |
| Flyer (print) | 2550×3300 (8.5×11 in @ 300dpi) | Canva |
| Hero image / ad creative | varies | fal.ai |

## Output
`out/design/{type}-{slug}-{ts}.png` + source reference (Canva design URL or Figma node ID) in sidecar `.meta.json`
