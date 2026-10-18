import { MarketplaceProduct, BrandPartner } from '../types';
import { INITIAL_PRODUCTS, INITIAL_BRANDS } from './mock_data';

export interface CatalogResponse {
  products: MarketplaceProduct[];
  brands: BrandPartner[];
  cachedAt: string;
}

/**
 * Server-Driven Data Cache with Precise Tags
 * Uses Next.js native fetch cache with granular cache tags ('catalog-products', 'marketplace-brands').
 */
export async function getServerCatalogData(): Promise<CatalogResponse> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${siteUrl}/api/edge/catalog`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Next.js Extended Fetch Options with Precise Cache Tags
      next: {
        tags: ['catalog-products', 'marketplace-brands'],
        revalidate: 3600, // Revalidate hourly or on-demand via revalidateCatalogTag()
      },
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data.products)) {
        return {
          products: json.data.products,
          brands: json.data.brands || INITIAL_BRANDS,
          cachedAt: new Date().toISOString(),
        };
      }
    }
  } catch {
    // Return baseline if edge endpoint is booting
  }

  return {
    products: INITIAL_PRODUCTS,
    brands: INITIAL_BRANDS,
    cachedAt: new Date().toISOString(),
  };
}
