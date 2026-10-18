import { MarketplaceProduct, BrandPartner } from '../types';

export const INITIAL_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'prod_aura_dress_01',
    name: 'Elysian Draped Silk Slip Dress',
    slug: 'elysian-draped-silk-slip-dress',
    brandName: 'Aura Atelier',
    brandSlug: 'aura-atelier',
    brandLogo: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&auto=format&fit=crop&q=80',
    price: 245,
    category: 'Dresses',
    fabric: '100% Mulberry Silk Crepe',
    isTryOnEligible: true,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
    tags: ['silk', 'slip dress', 'evening', 'minimalist']
  },
  {
    id: 'prod_vogue_jacket_01',
    name: 'Cyber-Tailored Oversized Blazer',
    slug: 'cyber-tailored-oversized-blazer',
    brandName: 'Vogue Nova',
    brandSlug: 'vogue-nova',
    brandLogo: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&auto=format&fit=crop&q=80',
    price: 320,
    category: 'Outerwear',
    fabric: 'Technical Weatherproof Twill',
    isTryOnEligible: true,
    image: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800&auto=format&fit=crop&q=80',
    tags: ['blazer', 'streetwear', 'tailored', 'oversized']
  },
  {
    id: 'prod_aura_pants_03',
    name: 'Aura Tailored Pleat Trousers',
    slug: 'aura-tailored-pleat-trousers',
    brandName: 'Aura Atelier',
    brandSlug: 'aura-atelier',
    brandLogo: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&auto=format&fit=crop&q=80',
    price: 180,
    category: 'Bottoms',
    fabric: 'Belgian Washed Linen',
    isTryOnEligible: true,
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
    tags: ['linen', 'trousers', 'minimalist']
  }
];

export const INITIAL_BRANDS: BrandPartner[] = [
  {
    name: 'Aura Atelier',
    slug: 'aura-atelier',
    tagline: 'Quiet Luxury & Ethical Silk',
    logo: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&auto=format&fit=crop&q=80',
    productCount: 2
  },
  {
    name: 'Vogue Nova',
    slug: 'vogue-nova',
    tagline: 'Neo-Streetwear & Tailoring',
    logo: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&auto=format&fit=crop&q=80',
    productCount: 1
  }
];
