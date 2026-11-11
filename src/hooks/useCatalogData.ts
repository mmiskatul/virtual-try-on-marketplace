'use client';

import { useQuery } from '@tanstack/react-query';
import { INITIAL_BRANDS, INITIAL_PRODUCTS } from '../data/catalogSeed';
import {
  fetchAllPublishedMarketplaceProducts,
  getAllBrands,
  getBrandStorefront,
  getProductBySlug,
} from '../services';

export function usePublishedProductsQuery() {
  return useQuery({
    queryKey: ['marketplace-published-products'],
    queryFn: fetchAllPublishedMarketplaceProducts,
    initialData: {
      products: INITIAL_PRODUCTS,
      source: 'catalog_fallback' as const,
    },
    staleTime: 60 * 1000,
  });
}

export function useBrandsDirectoryQuery() {
  return useQuery({
    queryKey: ['marketplace-brands-directory'],
    queryFn: () => getAllBrands(),
    initialData: INITIAL_BRANDS,
    staleTime: 60 * 1000,
  });
}

export function useBrandStorefrontQuery(brandSlug: string) {
  return useQuery({
    queryKey: ['brand-storefront', brandSlug],
    queryFn: () => getBrandStorefront(brandSlug),
    enabled: Boolean(brandSlug),
    staleTime: 45 * 1000,
  });
}

export function useProductDetailQuery(slugOrId: string, contextBrandSlug?: string) {
  return useQuery({
    queryKey: ['product-detail', slugOrId, contextBrandSlug || ''],
    queryFn: () => getProductBySlug(slugOrId, contextBrandSlug),
    enabled: Boolean(slugOrId),
    staleTime: 45 * 1000,
  });
}

