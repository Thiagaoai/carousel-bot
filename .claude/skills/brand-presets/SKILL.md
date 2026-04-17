# Brand Presets
# Category: Visual | Config
# Priority: 2

## Purpose
Provide consistent brand identity (colors, fonts, tone, logo path) for all 5 DockPlus
ecosystem businesses. Single source of truth for every video production.

## When to activate
- Every time reels-video-maker loads brand tokens (Step 4)
- Any visual output that needs company branding
- When copy-specialist needs tone of voice reference

## Protocol

### Step 1: Identify Company
Match input to one of 5 presets below.

### Step 2: Return Brand Object

#### Roberts Landscape Construction & Design
```yaml
slug: roberts
industry: Landscaping / Hardscape
location: Cape Cod, MA
colors:
  primary: "#2D5016"      # forest green
  secondary: "#8B7355"    # brown earth
  accent: "#F5A623"       # orange warmth
font: "Poppins Bold"
tone: "Trustworthy, local authority, craftsmanship pride"
cta_style: "Get a Free Quote" | "See Our Work" | "Call Now"
logo_path: "remotion-templates/assets/logos/roberts.png"
target_audience: "Homeowners Cape Cod 35-65, property value conscious"
seasonal_focus:
  spring: "cleanup, mulching, patio prep"
  summer: "completed projects, landscape design, pools"
  fall: "fall cleanup, hardscape, snow prep"
  winter: "design consultations, spring booking"
```

#### Cheesebread Bakery Cafe
```yaml
slug: cheesebread
industry: Bakery / Brazilian Cafe
location: Cape Cod, MA
colors:
  primary: "#D4A574"      # warm tan
  secondary: "#8B6F47"    # rich brown
  accent: "#FFE5CC"       # cream
font: "Playfair Display"
tone: "Warm, artisan, inviting, community-centered"
cta_style: "Visit Us Today" | "See Our Menu" | "Order Now"
logo_path: "remotion-templates/assets/logos/cheesebread.png"
target_audience: "Foodies, locals, tourists, 25-55, cafe culture"
seasonal_focus:
  spring: "seasonal menu, outdoor seating opening"
  summer: "summer drinks, acai, tourist specials"
  fall: "fall menu, pumpkin specials, cozy vibes"
  winter: "holiday catering, gift cards, warm drinks"
```

#### Cape Codder Home Improvement
```yaml
slug: cape-codder
industry: Home Remodeling
location: Cape Cod, MA
colors:
  primary: "#0055A8"      # navy trust
  secondary: "#F8A100"    # gold accent
  accent: "#E8E8E8"       # light gray
font: "Montserrat"
tone: "Reliable, professional, solution-oriented"
cta_style: "Schedule a Consultation" | "Get Your Free Estimate" | "Call Today"
logo_path: "remotion-templates/assets/logos/cape-codder.png"
target_audience: "Homeowners Cape Cod 35-65, renovation-ready"
seasonal_focus:
  spring: "deck repair, painting, window replacement"
  summer: "full renovations, summer specials"
  fall: "winterization, insulation, heating"
  winter: "bathroom renos, basement finishing"
```

#### All Granite & Stone
```yaml
slug: all-granite
industry: Countertops / Stone Fabrication
location: Cape Cod, MA
colors:
  primary: "#4A4A4A"      # dark gray stone
  secondary: "#8B8B8B"    # medium gray
  accent: "#D4AF37"       # gold luxury
font: "Raleway"
tone: "Premium, sophisticated, design-forward"
cta_style: "Visit Our Showroom" | "See Stone Collections" | "Get a Quote"
logo_path: "remotion-templates/assets/logos/all-granite.png"
target_audience: "Homeowners + designers, 30-60, kitchen/bath remodel"
seasonal_focus:
  spring: "outdoor kitchen countertops"
  summer: "kitchen remodels, showroom tours"
  fall: "indoor countertop season"
  winter: "stone selection guides, design trends"
```

#### DockPlus AI Solutions
```yaml
slug: dockplus-ai
industry: AI Automation Agency
location: US + BR (bilingual)
colors:
  primary: "#1E1E2E"      # dark terminal
  secondary: "#00FF00"    # neon green
  accent: "#00FFFF"       # cyan
font: "JetBrains Mono"
tone: "Bold, results-first, technical credibility, no fluff"
cta_style: "See It in Action" | "Book a Demo" | "Get Automations Running"
logo_path: "remotion-templates/assets/logos/dockplus-ai.png"
target_audience: "Small business owners, 30-55, want AI but don't know how"
seasonal_focus:
  spring: "spring marketing push, new client onboarding"
  summer: "case studies, ROI reports"
  fall: "year planning, automation demos"
  winter: "new year packages, tech trends"
```

## Constraints
- Never use colors from wrong company
- Never use default Tailwind blue — always use company-specific palette
- Never mix fonts between companies
- Always return full brand object when requested (no partial responses)

## Output format
YAML block with all brand tokens for the requested company.
