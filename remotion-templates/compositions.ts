import { BeforeAfterReveal } from './before-after-reveal';
import { EducationalTips } from './educational-tips';
import { PromoOffer } from './promo-offer';
import { ServiceShowcase } from './service-showcase';
import { TestimonialQuote } from './testimonial-quote';
import { DURATIONS, VIDEO_CONFIG, secondsToFrames } from './styles/animations';
import { getBrand, type BrandSlug } from './styles/brands';
import type {
  BeforeAfterProps,
  CompositionDefinition,
  EducationalTipsProps,
  PromoOfferProps,
  ServiceShowcaseProps,
  TestimonialQuoteProps,
} from './types';

const defaultBrandSlug: BrandSlug = 'roberts';

const createPlaceholder = (
  width: number,
  height: number,
  background: string,
  color: string,
  text: string
): string => {
  const bg = background.replace('#', '');
  const fg = color.replace('#', '');
  return `https://placehold.co/${width}x${height}/${bg}/${fg}?text=${encodeURIComponent(text)}`;
};

const withBrand = <TProps extends { brand: ReturnType<typeof getBrand>; logoUrl?: string }>(
  slug: BrandSlug,
  props: Omit<TProps, 'brand' | 'logoUrl'>
): TProps => {
  return {
    brand: getBrand(slug),
    ...props,
  } as TProps;
};

export const createBeforeAfterDefaults = (
  slug: BrandSlug = defaultBrandSlug
): BeforeAfterProps => {
  const brand = getBrand(slug);
  return withBrand<BeforeAfterProps>(slug, {
    beforeImage: createPlaceholder(1080, 1920, brand.colors.secondary, '#ffffff', 'Before'),
    afterImage: createPlaceholder(1080, 1920, brand.colors.primary, '#ffffff', 'After'),
    headline: 'Complete Driveway Transformation',
    location: 'Cape Cod, MA',
    ctaText: 'Ready for your transformation?',
  });
};

export const createServiceShowcaseDefaults = (
  slug: BrandSlug = defaultBrandSlug
): ServiceShowcaseProps => {
  const brand = getBrand(slug);
  return withBrand<ServiceShowcaseProps>(slug, {
    headline: 'Our Services',
    tagline: "Cape Cod's Trusted Local Experts",
    services: [
      {
        icon: '\uD83C\uDF3F',
        title: 'Landscaping',
        image: createPlaceholder(500, 400, brand.colors.primary, '#ffffff', 'Landscaping'),
      },
      {
        icon: '\uD83E\uDDF1',
        title: 'Hardscaping',
        image: createPlaceholder(500, 400, brand.colors.secondary, '#ffffff', 'Hardscaping'),
      },
      {
        icon: '\uD83C\uDF3A',
        title: 'Garden Design',
        image: createPlaceholder(500, 400, brand.colors.accent, brand.colors.primary, 'Gardens'),
      },
      {
        icon: '\u2744\uFE0F',
        title: 'Seasonal Care',
        image: createPlaceholder(500, 400, '#666666', '#ffffff', 'Seasonal'),
      },
    ],
    heroImage: createPlaceholder(1080, 1920, brand.colors.primary, '#ffffff', brand.name),
    ctaText: 'Get Your Free Estimate Today',
  });
};

export const createTestimonialDefaults = (
  slug: BrandSlug = defaultBrandSlug
): TestimonialQuoteProps => {
  return withBrand<TestimonialQuoteProps>(slug, {
    quote:
      'Roberts transformed our backyard into something we never imagined possible. The attention to detail was incredible.',
    customerName: 'Sarah M.',
    customerTitle: 'Homeowner, Falmouth MA',
    rating: 5,
    ctaText: 'See more reviews on Google',
  });
};

export const createEducationalTipsDefaults = (
  slug: BrandSlug = defaultBrandSlug
): EducationalTipsProps => {
  return withBrand<EducationalTipsProps>(slug, {
    mainTitle: 'Spring Landscaping Tips',
    tips: [
      {
        icon: '\uD83C\uDF31',
        title: 'Start with soil prep',
        description:
          'Test your soil pH and amend before planting. Cape Cod soil tends to be acidic.',
      },
      {
        icon: '\uD83D\uDCA7',
        title: 'Plan your irrigation',
        description:
          'Install drip irrigation early to save water and keep plants healthy all summer.',
      },
      {
        icon: '\uD83C\uDFE1',
        title: 'Define your zones',
        description:
          'Create distinct areas for entertaining, gardening, and relaxation.',
      },
    ],
    ctaText: 'Want expert help?',
    ctaAction: 'Get a Free Quote',
  });
};

export const createPromoOfferDefaults = (
  slug: BrandSlug = defaultBrandSlug
): PromoOfferProps => {
  return withBrand<PromoOfferProps>(slug, {
    attentionText: 'LIMITED TIME',
    offerTitle: 'Spring Special',
    offerDetail: '20% OFF Select Services',
    offerValue: 'Save up to $500 on your project',
    ctaText: 'Call Now',
    contactInfo: '(508) 464-4878',
  });
};

export type RegisteredComposition =
  | CompositionDefinition<BeforeAfterProps>
  | CompositionDefinition<ServiceShowcaseProps>
  | CompositionDefinition<TestimonialQuoteProps>
  | CompositionDefinition<EducationalTipsProps>
  | CompositionDefinition<PromoOfferProps>;

export const compositionRegistry: RegisteredComposition[] = [
  {
    id: 'BeforeAfterReveal',
    component: BeforeAfterReveal,
    durationInFrames: secondsToFrames(DURATIONS['before-after'], VIDEO_CONFIG.fps),
    fps: VIDEO_CONFIG.fps,
    width: VIDEO_CONFIG.width,
    height: VIDEO_CONFIG.height,
    defaultProps: createBeforeAfterDefaults(),
  },
  {
    id: 'ServiceShowcase',
    component: ServiceShowcase,
    durationInFrames: secondsToFrames(DURATIONS['service-showcase'], VIDEO_CONFIG.fps),
    fps: VIDEO_CONFIG.fps,
    width: VIDEO_CONFIG.width,
    height: VIDEO_CONFIG.height,
    defaultProps: createServiceShowcaseDefaults(),
  },
  {
    id: 'TestimonialQuote',
    component: TestimonialQuote,
    durationInFrames: secondsToFrames(DURATIONS['testimonial-quote'], VIDEO_CONFIG.fps),
    fps: VIDEO_CONFIG.fps,
    width: VIDEO_CONFIG.width,
    height: VIDEO_CONFIG.height,
    defaultProps: createTestimonialDefaults(),
  },
  {
    id: 'EducationalTips',
    component: EducationalTips,
    durationInFrames: secondsToFrames(DURATIONS['educational-tips'], VIDEO_CONFIG.fps),
    fps: VIDEO_CONFIG.fps,
    width: VIDEO_CONFIG.width,
    height: VIDEO_CONFIG.height,
    defaultProps: createEducationalTipsDefaults(),
  },
  {
    id: 'PromoOffer',
    component: PromoOffer,
    durationInFrames: secondsToFrames(DURATIONS['promo-offer'], VIDEO_CONFIG.fps),
    fps: VIDEO_CONFIG.fps,
    width: VIDEO_CONFIG.width,
    height: VIDEO_CONFIG.height,
    defaultProps: createPromoOfferDefaults(),
  },
];
