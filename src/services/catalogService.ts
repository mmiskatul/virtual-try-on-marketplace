import {
  MarketplaceCategory,
  MarketplaceCollection,
  MarketplaceProduct,
  ProductReview,
  TryOnCategory,
} from '../types';
import {
  ALL_SEED_PRODUCTS,
  INITIAL_REVIEWS,
  MARKETPLACE_CATEGORIES,
  MARKETPLACE_COLLECTIONS,
  SEED_BRANDS,
} from '../data/catalogSeed';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:4000';

const brandBySlug = new Map(SEED_BRANDS.map((b) => [b.slug, b]));

export interface DiscoveryFilterParams {
  q?: string;
  category?: string;
  audience?: string;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sizes?: string[];
  colors?: string[];
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  tryOnOnly?: boolean;
  collection?: string;
  productType?: 'all' | 'new' | 'trending' | 'bestseller';
  sortBy?:
    | 'recommended'
    | 'newest'
    | 'popular'
    | 'rating'
    | 'price-asc'
    | 'price-desc'
    | 'reviews';
  page?: number;
  limit?: number;
}

export function normalizeBackendProduct(raw: any): MarketplaceProduct {
  const brandSlug =
    raw.brandSlug ||
    String(raw.brandName || 'aura-atelier')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
  const seedBrand = brandBySlug.get(brandSlug);
  const matchedSeed = ALL_SEED_PRODUCTS.find(
    (s) => s.id === raw.id || s.slug === raw.slug
  );

  const images: string[] =
    Array.isArray(raw.images) && raw.images.length > 0
      ? raw.images
      : raw.image
      ? [raw.image]
      : matchedSeed?.images || [
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
        ];

  const variants = Array.isArray(raw.variants) && raw.variants.length > 0
    ? raw.variants
    : matchedSeed?.variants || [
        {
          id: `${raw.id}_m`,
          sku: raw.sku || `${String(raw.id).toUpperCase()}-M`,
          size: 'M',
          color: 'Classic',
          stockQuantity: 10,
          available: true,
        },
      ];

  const sizes: string[] = Array.from(
    new Set<string>(
      variants
        .map((v: any) => v.size)
        .filter((s: unknown): s is string => typeof s === 'string' && s.length > 0)
    )
  );

  const colors = matchedSeed?.colors || [
    {
      name: variants[0]?.color || 'Charcoal',
      hex: '#1C1917',
      image: images[0],
    },
  ];

  const compareAtPrice = raw.compareAtPrice ?? matchedSeed?.compareAtPrice;
  const price = Number(raw.price ?? matchedSeed?.price ?? 0);
  const discountPercent =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : matchedSeed?.discountPercent;

  const marketplacePublished = Boolean(raw.marketplacePublished ?? true);
  const brandStorefrontPublished = Boolean(raw.brandStorefrontPublished ?? true);

  return {
    id: raw.id,
    brandId: raw.tenantId || raw.brandId || seedBrand?.id || 'tenant_aura',
    tenantId: raw.tenantId || raw.brandId || seedBrand?.id,
    categoryId: raw.categoryId || matchedSeed?.categoryId || 'cat_apparel',
    name: raw.name || matchedSeed?.name || 'Untitled Garment',
    slug:
      raw.slug ||
      String(raw.name || raw.id)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-'),
    description:
      raw.description ||
      matchedSeed?.description ||
      'Editorial apparel crafted for virtual fit visualization.',
    brandName: raw.brandName || seedBrand?.name || matchedSeed?.brandName || 'Atelier Partner',
    brandSlug,
    brandLogo:
      raw.brandLogo ||
      seedBrand?.logo ||
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&auto=format&fit=crop&q=80',
    brandVerified: seedBrand?.verificationStatus === 'VERIFIED' || true,
    price,
    compareAtPrice,
    discountPercent,
    category: raw.category || matchedSeed?.category || 'Dresses',
    subCategory: raw.subCategory || matchedSeed?.subCategory,
    audience: matchedSeed?.audience || 'Women',
    collections: raw.collection
      ? [raw.collection, ...(matchedSeed?.collections || [])]
      : matchedSeed?.collections || ['Premium Fashion'],
    fabric: raw.fabric || matchedSeed?.fabric || raw.specs?.Material || 'Editorial Natural Fiber',
    materialDetails: matchedSeed?.materialDetails,
    fitNotes: matchedSeed?.fitNotes,
    specifications: raw.specs || matchedSeed?.specifications || {},
    sizes: sizes.length > 0 ? sizes : matchedSeed?.sizes || ['S', 'M', 'L'],
    colors,
    variants,
    image: images[0],
    images,
    sku: raw.sku || matchedSeed?.sku,
    inStock: variants.some((v: any) => v.available !== false && (v.stockQuantity ?? 1) > 0),
    rating: matchedSeed?.rating ?? 4.8,
    reviewCount: matchedSeed?.reviewCount ?? 42,
    totalSold: matchedSeed?.totalSold ?? 160,
    viewsCount: matchedSeed?.viewsCount ?? 2840,
    favoritesCount: matchedSeed?.favoritesCount ?? 310,
    isNewArrival: matchedSeed?.isNewArrival ?? true,
    isTrending: matchedSeed?.isTrending ?? true,
    isBestSeller: matchedSeed?.isBestSeller ?? false,
    isFeatured: matchedSeed?.isFeatured ?? true,
    isTryOnEligible: raw.isTryOnEligible ?? true,
    tryOnCategory: (raw.tryOnCategory || matchedSeed?.tryOnCategory || 'tops') as TryOnCategory,
    marketplaceStatus: marketplacePublished ? 'PUBLISHED' : 'UNPUBLISHED',
    marketplacePublished,
    storefrontVisibility: brandStorefrontPublished ? 'VISIBLE' : 'HIDDEN',
    brandStorefrontPublished,
    publishedAt: raw.createdAt
      ? new Date(raw.createdAt).toISOString()
      : matchedSeed?.publishedAt || new Date().toISOString(),
    tags: Array.isArray(raw.tags) ? raw.tags : matchedSeed?.tags || [],
    shippingPolicy: matchedSeed?.shippingPolicy,
    returnPolicy: matchedSeed?.returnPolicy,
  };
}

/**
 * Fetches live marketplace products from backend (:4000) and merges cleanly with
 * curated published catalog entries. Strictly enforces publication status === PUBLISHED.
 */
export async function fetchAllPublishedMarketplaceProducts(): Promise<{
  products: MarketplaceProduct[];
  source: 'live_backend' | 'catalog_fallback';
}> {
  let liveProducts: MarketplaceProduct[] = [];
  let source: 'live_backend' | 'catalog_fallback' = 'catalog_fallback';

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${API_BASE}/api/v1/marketplace/products`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    clearTimeout(timer);

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json)) {
        liveProducts = json
          .map(normalizeBackendProduct)
          .filter((p) => p.marketplaceStatus === 'PUBLISHED' && p.marketplacePublished === true);
        source = 'live_backend';
      }
    }
  } catch {
    // Graceful fallback when backend is unreachable
  }

  // Merge live backend items (priority) with curated seed published products without duplicating id/slug
  const seenIds = new Set(liveProducts.map((p) => p.id));
  const seenSlugs = new Set(liveProducts.map((p) => p.slug));

  const publishedSeed = ALL_SEED_PRODUCTS.filter(
    (p) =>
      p.marketplaceStatus === 'PUBLISHED' &&
      p.marketplacePublished === true &&
      !seenIds.has(p.id) &&
      !seenSlugs.has(p.slug)
  );

  return {
    products: [...liveProducts, ...publishedSeed],
    source,
  };
}

export function filterAndSortProducts(
  sourceProducts: MarketplaceProduct[],
  filters: DiscoveryFilterParams,
  options?: { allowUnpublishedForBrandSlug?: string }
): {
  items: MarketplaceProduct[];
  total: number;
  page: number;
  totalPages: number;
} {
  let items = sourceProducts.filter((p) => {
    if (options?.allowUnpublishedForBrandSlug) {
      return (
        p.brandSlug === options.allowUnpublishedForBrandSlug &&
        p.brandStorefrontPublished === true &&
        p.storefrontVisibility === 'VISIBLE' &&
        p.marketplaceStatus !== 'DRAFT' &&
        p.marketplaceStatus !== 'ARCHIVED'
      );
    }
    return p.marketplaceStatus === 'PUBLISHED' && p.marketplacePublished === true;
  });

  if (filters.q && filters.q.trim()) {
    const q = filters.q.trim().toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        (p.collections || []).some((c) => c.toLowerCase().includes(q))
    );
  }

  if (filters.category && filters.category.toLowerCase() !== 'all') {
    const cat = filters.category.toLowerCase();
    items = items.filter(
      (p) =>
        p.category.toLowerCase() === cat ||
        p.subCategory?.toLowerCase() === cat ||
        (cat === "men's fashion" && (p.audience === 'Men' || p.category.toLowerCase() === "men's fashion")) ||
        (cat === "women's fashion" && (p.audience === 'Women' || p.category.toLowerCase() === "women's fashion")) ||
        (cat === 'men' && p.audience === 'Men') ||
        (cat === 'women' && p.audience === 'Women') ||
        (cat === 'traditional' && (p.audience === 'Traditional' || p.category === 'Traditional Wear' || p.category === 'Sarees'))
    );
  }

  if (filters.audience && filters.audience.toLowerCase() !== 'all') {
    const aud = filters.audience.toLowerCase();
    items = items.filter((p) => {
      if (aud === 'traditional') {
        return p.category === 'Traditional Wear' || p.category === 'Sarees' || p.audience === 'Traditional';
      }
      return p.audience?.toLowerCase() === aud || p.category.toLowerCase().includes(aud);
    });
  }

  if (filters.brands && filters.brands.length > 0) {
    const set = new Set(filters.brands.map((b) => b.toLowerCase()));
    items = items.filter(
      (p) => set.has(p.brandSlug.toLowerCase()) || set.has(p.brandName.toLowerCase())
    );
  }

  if (typeof filters.minPrice === 'number' && !Number.isNaN(filters.minPrice)) {
    items = items.filter((p) => p.price >= filters.minPrice!);
  }
  if (typeof filters.maxPrice === 'number' && !Number.isNaN(filters.maxPrice)) {
    items = items.filter((p) => p.price <= filters.maxPrice!);
  }

  if (typeof filters.minRating === 'number' && filters.minRating > 0) {
    items = items.filter((p) => p.rating >= filters.minRating!);
  }

  if (filters.sizes && filters.sizes.length > 0) {
    const sizeSet = new Set(filters.sizes.map((s) => s.toUpperCase()));
    items = items.filter((p) => p.sizes.some((s) => sizeSet.has(s.toUpperCase())));
  }

  if (filters.colors && filters.colors.length > 0) {
    const colorSet = new Set(filters.colors.map((c) => c.toLowerCase()));
    items = items.filter((p) =>
      p.colors.some((c) => Array.from(colorSet).some((needle) => c.name.toLowerCase().includes(needle)))
    );
  }

  if (filters.inStockOnly) {
    items = items.filter((p) => p.inStock);
  }

  if (filters.onSaleOnly) {
    items = items.filter((p) => Boolean(p.compareAtPrice && p.compareAtPrice > p.price));
  }

  if (filters.tryOnOnly) {
    items = items.filter((p) => p.isTryOnEligible);
  }

  if (filters.collection && filters.collection.toLowerCase() !== 'all') {
    const colNeedle = filters.collection.toLowerCase();
    items = items.filter((p) =>
      (p.collections || []).some(
        (c) => c.toLowerCase() === colNeedle || c.toLowerCase().replace(/\s+/g, '-') === colNeedle
      )
    );
  }

  if (filters.productType && filters.productType !== 'all') {
    if (filters.productType === 'new') items = items.filter((p) => p.isNewArrival);
    if (filters.productType === 'trending') items = items.filter((p) => p.isTrending);
    if (filters.productType === 'bestseller') items = items.filter((p) => p.isBestSeller || p.totalSold >= 200);
  }

  const sortBy = filters.sortBy || 'recommended';
  items = [...items].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      case 'popular':
        return b.totalSold + (b.favoritesCount || 0) - (a.totalSold + (a.favoritesCount || 0));
      case 'rating':
        return b.rating - a.rating || b.reviewCount - a.reviewCount;
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'reviews':
        return b.reviewCount - a.reviewCount;
      case 'recommended':
      default:
        return Number(b.isFeatured) - Number(a.isFeatured) || b.totalSold - a.totalSold;
    }
  });

  const total = items.length;
  const limit = filters.limit && filters.limit > 0 ? filters.limit : 100;
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const paged = items.slice((page - 1) * limit, page * limit);

  return { items: paged, total, page, totalPages };
}

export async function getProductBySlug(
  slugOrId: string,
  contextBrandSlug?: string
): Promise<{
  product: MarketplaceProduct | null;
  relatedSameBrand: MarketplaceProduct[];
  similarCategory: MarketplaceProduct[];
  reviews: ProductReview[];
  isStorefrontExclusive: boolean;
}> {
  const { products: publishedPool } = await fetchAllPublishedMarketplaceProducts();

  // First check published marketplace catalog
  let matched = publishedPool.find((p) => p.slug === slugOrId || p.id === slugOrId) || null;

  // If not in global marketplace, check brand storefront catalog if contextBrandSlug matches (or direct safe lookup excluding DRAFT/ARCHIVED)
  let isStorefrontExclusive = false;
  if (!matched) {
    const storefrontCandidate = ALL_SEED_PRODUCTS.find(
      (p) =>
        (p.slug === slugOrId || p.id === slugOrId) &&
        p.brandStorefrontPublished === true &&
        p.storefrontVisibility === 'VISIBLE' &&
        p.marketplaceStatus !== 'DRAFT' &&
        p.marketplaceStatus !== 'ARCHIVED' &&
        (!contextBrandSlug || p.brandSlug === contextBrandSlug)
    );
    if (storefrontCandidate) {
      matched = storefrontCandidate;
      isStorefrontExclusive = true;
    }
  }

  // Also attempt live backend lookup by product ID
  if (!matched) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/marketplace/products/${encodeURIComponent(slugOrId)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.product) {
          matched = normalizeBackendProduct(json.product);
        }
      }
    } catch {
      // Ignore
    }
  }

  if (!matched) {
    return {
      product: null,
      relatedSameBrand: [],
      similarCategory: [],
      reviews: [],
      isStorefrontExclusive: false,
    };
  }

  const relatedSameBrand = (isStorefrontExclusive
    ? ALL_SEED_PRODUCTS.filter(
        (p) =>
          p.brandSlug === matched!.brandSlug &&
          p.brandStorefrontPublished &&
          p.marketplaceStatus !== 'DRAFT' &&
          p.marketplaceStatus !== 'ARCHIVED'
      )
    : publishedPool.filter((p) => p.brandSlug === matched!.brandSlug)
  )
    .filter((p) => p.id !== matched!.id)
    .slice(0, 4);

  const similarCategory = publishedPool
    .filter((p) => p.id !== matched!.id && p.category === matched!.category)
    .slice(0, 4);

  const reviews = INITIAL_REVIEWS.filter((r) => r.productId === matched!.id);

  return {
    product: matched,
    relatedSameBrand,
    similarCategory,
    reviews,
    isStorefrontExclusive,
  };
}

export function getCategoriesWithCounts(
  publishedProducts: MarketplaceProduct[]
): MarketplaceCategory[] {
  return MARKETPLACE_CATEGORIES.map((cat) => {
    const count = publishedProducts.filter((p) => {
      if (cat.name === "Men's Fashion") {
        return p.audience === 'Men' || p.category === "Men's Fashion";
      }
      if (cat.name === "Women's Fashion") {
        return p.audience === 'Women' || p.category === "Women's Fashion";
      }
      if (cat.name === 'Traditional Wear') {
        return p.category === 'Traditional Wear' || p.category === 'Sarees' || p.audience === 'Traditional';
      }
      return p.category.toLowerCase() === cat.name.toLowerCase();
    }).length;

    return {
      ...cat,
      productCount: count,
    };
  });
}

export function getCollectionsWithCounts(
  publishedProducts: MarketplaceProduct[]
): Array<MarketplaceCollection & { productCount: number }> {
  return MARKETPLACE_COLLECTIONS.map((col) => ({
    ...col,
    productCount: publishedProducts.filter((p) =>
      (p.collections || []).some((c) => c.toLowerCase() === col.name.toLowerCase())
    ).length,
  }));
}
