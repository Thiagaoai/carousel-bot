# Skill: platform-specs

## When to activate
Any time an asset needs specific dimensions, duration limits, or character counts.

## Purpose
Single source of truth for all platform technical specs. No more "is TikTok 1080×1920 or 1280×720?" guessing.

## Image specs
| Platform | Format | Dimensions | Aspect |
|---|---|---|---|
| Instagram feed | Square | 1080×1080 | 1:1 |
| Instagram feed | Portrait | 1080×1350 | 4:5 |
| Instagram Story | Vertical | 1080×1920 | 9:16 |
| Instagram Reel cover | Vertical | 1080×1920 | 9:16 |
| Facebook feed | Landscape | 1200×630 | 1.91:1 |
| Facebook cover | Landscape | 851×315 | — |
| Twitter/X feed | Landscape | 1600×900 | 16:9 |
| Twitter header | Landscape | 1500×500 | 3:1 |
| LinkedIn feed | Square | 1200×1200 | 1:1 |
| LinkedIn banner | Landscape | 1584×396 | 4:1 |
| LinkedIn doc | Portrait | 1080×1350 | 4:5 |
| YouTube thumbnail | Landscape | 1280×720 | 16:9 |
| YouTube channel art | Landscape | 2560×1440 | 16:9 |
| TikTok (image post) | Vertical | 1080×1920 | 9:16 |

## Video specs
| Platform | Format | Dimensions | Duration | FPS | Max size |
|---|---|---|---|---|---|
| Instagram Reel | MP4 | 1080×1920 | 15-90s | 30 | 4GB |
| Instagram feed video | MP4 | 1080×1080 or 1080×1350 | 3-60s | 30 | 4GB |
| Instagram Story | MP4 | 1080×1920 | 15s/segment | 30 | 100MB |
| TikTok | MP4 | 1080×1920 | 15-180s | 30-60 | 287MB |
| YouTube Shorts | MP4 | 1080×1920 | ≤60s | 30 | — |
| YouTube regular | MP4 | 1920×1080 | — | 30-60 | 256GB |
| Facebook Reel | MP4 | 1080×1920 | 15-90s | 30 | 4GB |
| Facebook feed video | MP4 | 1080×1080 | 1-240min | 30 | 10GB |
| Twitter video | MP4 | 1280×720 | ≤140s | 30 | 512MB |
| LinkedIn video | MP4 | 1920×1080 or 1080×1920 | 3s-10min | 30 | 5GB |

## Caption character limits
| Platform | Limit | First visible |
|---|---|---|
| Instagram caption | 2,200 | 125 |
| Instagram alt-text | 1,000 | — |
| TikTok caption | 4,000 | 100 |
| Twitter tweet | 280 | 280 |
| Twitter long-form (Premium) | 25,000 | — |
| LinkedIn post | 3,000 | 210 |
| LinkedIn article | 125,000 | — |
| YouTube description | 5,000 | 100 (mobile feed) |
| YouTube title | 100 | 60 |
| Facebook post | 63,206 | 80 |

## Ad copy limits (2026)
| Placement | Primary | Headline | Desc |
|---|---|---|---|
| Meta Feed | 125 | 40 | 30 |
| Meta Story | 125 | 40 | — |
| Google Search RSA | 90 | 30 (15 max) | 90 (4 max) |
| TikTok In-Feed | 2,200 | 40 | — |
| LinkedIn Sponsored | 600 | 150 | 70 |

## Use this skill
- Call before rendering any asset to confirm dimensions
- Call before writing any caption to confirm char limit
- Never hardcode specs in agent prompts — always reference this skill
