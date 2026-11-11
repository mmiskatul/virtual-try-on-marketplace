'use client';

import { usePublishedProductsQuery } from './useCatalogData';
import { useMarketplaceStore } from '../stores/useMarketplaceStore';

export function useOptimisticCatalog() {
  const { data, isLoading } = usePublishedProductsQuery();
  const wishlistIds = useMarketplaceStore((s) => s.wishlistIds);
  const toggleWishlist = useMarketplaceStore((s) => s.toggleWishlist);

  return {
    products: data.products,
    isLoading,
    wishlistIds: new Set(wishlistIds),
    isWishlisted: (id: string) => wishlistIds.includes(id),
    toggleWishlist,
    isSyncing: false,
  };
}
