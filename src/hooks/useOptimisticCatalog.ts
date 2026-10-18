'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { MarketplaceProduct } from '../types';
import { INITIAL_PRODUCTS } from '../lib/mock_data';
import { revalidateCatalogTag } from '../app/actions/revalidate';

export function useOptimisticCatalog() {
  const queryClient = useQueryClient();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  // 1. TanStack Query for Catalog Server State
  const { data: products = INITIAL_PRODUCTS, isLoading } = useQuery<MarketplaceProduct[]>({
    queryKey: ['marketplace-catalog'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/edge/catalog');
        if (res.ok) {
          const json = await res.json();
          return json.data.products;
        }
      } catch {
        // Fallback gracefully
      }
      return INITIAL_PRODUCTS;
    },
    initialData: INITIAL_PRODUCTS,
    staleTime: 60 * 1000,
  });

  // 2. Optimistic Mutation: Toggle Wishlist Item
  // UI updates instantly on click, while syncing with server in the background
  const toggleWishlistMutation = useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      // Background simulated network sync
      await new Promise((resolve) => setTimeout(resolve, 350));
      return { productId, synced: true };
    },
    onMutate: async ({ productId }) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['marketplace-catalog'] });

      // Snapshot previous wishlist state
      const previousWishlist = new Set(wishlistIds);

      // Optimistically update the UI instantly
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (next.has(productId)) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });

      // Return context for potential rollback
      return { previousWishlist };
    },
    onError: (_err, _variables, context) => {
      // Rollback to previous state if sync fails
      if (context?.previousWishlist) {
        setWishlistIds(context.previousWishlist);
      }
    },
    onSettled: () => {
      // Invalidate queries & sync background server cache
      queryClient.invalidateQueries({ queryKey: ['marketplace-catalog'] });
      revalidateCatalogTag('catalog-products').catch(() => {});
    },
  });

  return {
    products,
    isLoading,
    wishlistIds,
    isWishlisted: (id: string) => wishlistIds.has(id),
    toggleWishlist: (productId: string) => toggleWishlistMutation.mutate({ productId }),
    isSyncing: toggleWishlistMutation.isPending,
  };
}
