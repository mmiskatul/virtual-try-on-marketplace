import { BrandPartner, MarketplaceProduct } from '../types';
import { ALL_SEED_PRODUCTS, SEED_BRANDS } from '../data/catalogSeed';
import { fetchAllPublishedMarketplaceProducts, normalizeBackendProduct } from './catalogService';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:4000';

export interface BrandDirectoryFilter {
  q?: string;
  filter?: 'all' | 'featured' | 'verified' | 'popular' | 'recent';
  category?: string;
}

export async function getAllBrands(filter?: BrandDirectoryFilter): Promise<BrandPartner[]> {
  const { products: publishedProducts } = await fetchAllPublishedMarketplaceProducts();

  // Compute live product counts dynamically from customer-visible products
  const enriched = SEED_BRANDS.map((brand) => {
    const visibleProducts = ALL_SEED_PRODUCTS.filter(
      (p) =>
        p.brandSlug === brand.slug &&
        p.brandStorefrontPublished &&
        p.marketplaceStatus !== 'DRAFT' &&
        p.marketplaceStatus !== 'ARCHIVED'
    );
    const livePublishedCount = publishedProducts.filter((p) => p.brandSlug === brand.slug).length;
    return {
      ...brand,
      productCount: Math.max(visibleProducts.length, livePublishedCount, brand.productCount),
    };
  });

  let result = enriched;

  if (filter?.q?.trim()) {
    const q = filter.q.trim().toLowerCase();
    result = result.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.tagline.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.categoryFocus.toLowerCase().includes(q) ||
        b.originCity.toLowerCase().includes(q)
    );
  }

  if (filter?.category && filter.category.toLowerCase() !== 'all') {
    const c = filter.category.toLowerCase();
    result = result.filter((b) => b.categoryFocus.toLowerCase().includes(c));
  }

  if (filter?.filter === 'featured') {
    result = result.filter((b) => b.isFeatured);
  } else if (filter?.filter === 'verified') {
    result = result.filter((b) => b.verificationStatus === 'VERIFIED');
  } else if (filter?.filter === 'popular') {
    result = [...result].sort((a, b) => b.totalFollowers - a.totalFollowers);
  } else if (filter?.filter === 'recent') {
    result = result.filter((b) => b.isRecentlyJoined);
  }

  return result;
}

/**
 * Fetches a Brand's exclusive public storefront catalog.
 * Strict isolation rule:
 * - Shows ONLY customer-visible products owned by this brand (brandStorefrontPublished === true)
 * - Includes brand-exclusive unpublished-to-marketplace products
 * - NEVER returns DRAFT/ARCHIVED products or products from other brands
 */
export async function getBrandStorefront(brandSlug: string): Promise<{
  brand: BrandPartner | null;
  products: MarketplaceProduct[];
  tryOnProducts: MarketplaceProduct[];
  source: 'live_backend' | 'catalog_fallback';
}> {
  const seedBrand = SEED_BRANDS.find((b) => b.slug === brandSlug) || null;
  let liveTenant: any = null;
  let liveProducts: MarketplaceProduct[] = [];
  let source: 'live_backend' | 'catalog_fallback' = 'catalog_fallback';

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${API_BASE}/api/v1/internal/storefront/${encodeURIComponent(brandSlug)}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    clearTimeout(timer);

    if (res.ok) {
      const json = await res.json();
      if (json?.tenant) {
        liveTenant = json.tenant;
        source = 'live_backend';
        if (Array.isArray(json.products)) {
          liveProducts = json.products
            .map((raw: any) =>
              normalizeBackendProduct({
                ...raw,
                brandName: json.tenant.name,
                brandSlug: json.tenant.slug,
                brandLogo: json.tenant.logoUrl,
              })
            )
            // Strict brand + visibility ownership guard
            .filter(
              (p: MarketplaceProduct) =>
                p.brandSlug === json.tenant.slug &&
                p.brandStorefrontPublished === true &&
                p.marketplaceStatus !== 'DRAFT' &&
                p.marketplaceStatus !== 'ARCHIVED'
            );
        }
      }
    }
  } catch {
    // Graceful fallback when backend offline
  }

  if (!seedBrand && !liveTenant) {
    return { brand: null, products: [], tryOnProducts: [], source };
  }

  const brand: BrandPartner = seedBrand
    ? {
        ...seedBrand,
        name: liveTenant?.name || seedBrand.name,
        description: liveTenant?.description || seedBrand.description,
        logo: liveTenant?.logoUrl || seedBrand.logo,
        coverImage: liveTenant?.bannerUrl || seedBrand.coverImage,
        announcement: liveTenant?.storefrontSettings?.announcement || seedBrand.announcement,
        accentColor: liveTenant?.storefrontSettings?.accentColor || seedBrand.accentColor,
      }
    : {
        id: liveTenant.id,
        name: liveTenant.name,
        slug: liveTenant.slug,
        tagline: liveTenant.storefrontSettings?.aboutText || 'Independent Fashion Brand',
        description: liveTenant.description || 'Verified independent merchant storefront.',
        logo:
          liveTenant.logoUrl ||
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&auto=format&fit=crop&q=80',
        coverImage:
          liveTenant.bannerUrl ||
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80',
        verificationStatus: 'VERIFIED',
        categoryFocus: 'Apparel Studio',
        originCity: 'Partner Boutique',
        rating: 4.8,
        totalReviews: 24,
        totalFollowers: 1200,
        productCount: liveProducts.length,
        accentColor: liveTenant.storefrontSettings?.accentColor || '#1C1917',
        announcement: liveTenant.storefrontSettings?.announcement,
      };

  const seenIds = new Set(liveProducts.map((p) => p.id));
  const seedOwnedProducts = ALL_SEED_PRODUCTS.filter(
    (p) =>
      p.brandSlug === brand.slug &&
      p.brandStorefrontPublished === true &&
      p.storefrontVisibility === 'VISIBLE' &&
      p.marketplaceStatus !== 'DRAFT' &&
      p.marketplaceStatus !== 'ARCHIVED' &&
      !seenIds.has(p.id)
  );

  // Final isolation pass guaranteeing ONLY products owned by this exact brand render here
  const products = [...liveProducts, ...seedOwnedProducts].filter(
    (p) =>
      p.brandSlug === brand.slug &&
      p.brandStorefrontPublished === true &&
      p.marketplaceStatus !== 'DRAFT' &&
      p.marketplaceStatus !== 'ARCHIVED'
  );

  const tryOnProducts = products.filter((p) => p.isTryOnEligible && p.brandSlug === brand.slug);

  return {
    brand: { ...brand, productCount: products.length },
    products,
    tryOnProducts,
    source,
  };
}

