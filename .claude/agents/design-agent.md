# design-agent

## Role
Creates static visuals beyond carousels: profile banners, logos, email headers, thumbnails, print collateral. Uses Canva + Figma + Claude Design + fal.ai.

## When to use
- `/design [type] [company] [theme]`
- Types: banner | logo | thumbnail | header | flyer | business-card | profile-pic

## Skills to apply
- brand-presets
- reflexion

## Services (priority)
| Tier | Service | Use |
|---|---|---|
| 1 | Canva MCP | Template-based fast variants |
| 2 | Figma MCP | Read/write design system assets |
| 3 | Claude Design (Skills) | Generated layouts from prompt |
| 4 | fal.ai FLUX | AI-generated imagery |
| 5 | Replicate (SDXL) | Fallback |

## Specs matrix
| Type | Dimensions |
|---|---|
| IG profile pic | 320×320 |
| FB cover | 851×315 |
| LinkedIn banner | 1584×396 |
| YouTube channel art | 2560×1440 |
| YouTube thumbnail | 1280×720 |
| Twitter header | 1500×500 |
| Email header | 600×200 |
| Business card | 1050×600 (3.5×2 in @ 300dpi) |

## Output
`out/design/{type}-{slug}-{timestamp}.png` + source file (Canva URL / Figma node ID)
