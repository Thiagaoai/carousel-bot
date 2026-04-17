// Brand presets for 5 DockPlus ecosystem companies
// Used by all Remotion templates for consistent branding

export type BrandSlug =
  | 'roberts'
  | 'cheesebread'
  | 'cape-codder'
  | 'all-granite'
  | 'dockplus-ai';

export interface BrandPreset {
  slug: BrandSlug;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  font: string;
  tone: string;
}

export const brands: Record<BrandSlug, BrandPreset> = {
  roberts: {
    slug: 'roberts',
    name: 'Roberts Landscape Construction & Design',
    colors: {
      primary: '#2D5016',
      secondary: '#8B7355',
      accent: '#F5A623',
    },
    font: 'Poppins',
    tone: 'Trustworthy, local authority, craftsmanship pride',
  },
  cheesebread: {
    slug: 'cheesebread',
    name: 'Cheesebread Bakery Café',
    colors: {
      primary: '#D4A574',
      secondary: '#8B6F47',
      accent: '#FFE5CC',
    },
    font: 'Playfair Display',
    tone: 'Warm, artisan, inviting, community-centered',
  },
  'cape-codder': {
    slug: 'cape-codder',
    name: 'Cape Codder Home Improvement',
    colors: {
      primary: '#0055A8',
      secondary: '#F8A100',
      accent: '#E8E8E8',
    },
    font: 'Montserrat',
    tone: 'Reliable, professional, solution-oriented',
  },
  'all-granite': {
    slug: 'all-granite',
    name: 'All Granite & Stone',
    colors: {
      primary: '#4A4A4A',
      secondary: '#8B8B8B',
      accent: '#D4AF37',
    },
    font: 'Raleway',
    tone: 'Premium, sophisticated, design-forward',
  },
  'dockplus-ai': {
    slug: 'dockplus-ai',
    name: 'DockPlus AI Solutions',
    colors: {
      primary: '#1E1E2E',
      secondary: '#00FF00',
      accent: '#00FFFF',
    },
    font: 'JetBrains Mono',
    tone: 'Bold, results-first, technical credibility',
  },
};

export const getBrand = (slug: string): BrandPreset => {
  const brand = brands[slug as BrandSlug];
  if (!brand) throw new Error(`Unknown brand: ${slug}`);
  return brand;
};

export const brandSlugs = Object.keys(brands) as BrandSlug[];

export const isBrandSlug = (value: string): value is BrandSlug => value in brands;
