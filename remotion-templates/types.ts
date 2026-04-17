import type { ComponentType } from 'react';
import type { BrandPreset } from './styles/brands';

export interface BrandAwareProps {
  brand: BrandPreset;
  logoUrl?: string;
}

export interface BeforeAfterProps extends BrandAwareProps {
  beforeImage: string;
  afterImage: string;
  headline: string;
  location: string;
  ctaText: string;
}

export interface ServiceItem {
  icon: string;
  title: string;
  image: string;
}

export interface ServiceShowcaseProps extends BrandAwareProps {
  headline: string;
  tagline: string;
  services: [ServiceItem, ServiceItem, ServiceItem, ServiceItem];
  heroImage: string;
  ctaText: string;
}

export interface TestimonialQuoteProps extends BrandAwareProps {
  quote: string;
  customerName: string;
  customerTitle?: string;
  avatarUrl?: string;
  rating: number;
  ctaText: string;
}

export interface Tip {
  icon: string;
  title: string;
  description: string;
  image?: string;
}

export interface EducationalTipsProps extends BrandAwareProps {
  mainTitle: string;
  tips: [Tip, Tip, Tip];
  ctaText: string;
  ctaAction: string;
}

export interface PromoOfferProps extends BrandAwareProps {
  attentionText: string;
  offerTitle: string;
  offerDetail: string;
  offerValue?: string;
  ctaText: string;
  contactInfo: string;
  backgroundImage?: string;
}

export interface CompositionDefinition<TProps> {
  id: string;
  component: ComponentType<TProps>;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  defaultProps: TProps;
}
