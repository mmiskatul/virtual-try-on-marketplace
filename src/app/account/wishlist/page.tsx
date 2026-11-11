'use client';

import React, { useMemo } from 'react';
import { Heart } from 'lucide-react';
import { usePublishedProductsQuery } from '../../../hooks/useCatalogData';
import { useMarketplaceStore } from '../../../stores/useMarketplaceStore';
import { useMounted } from '../../../hooks/useMounted';
import { AccountLayoutShell } from '../../../components/account/AccountSidebar';
import { ProductGrid } from '../../../components/modules/ProductGrid';
import { EmptyState } from '../../../components/ui/States';

export default function AccountWishlistPage() {
  const mounted = useMounted();
  const { data } = usePublishedProductsQuery();
  const wishlistIds = useMarketplaceStore((s) => s.wishlistIds);

  const savedProducts = useMemo(() => {
    if (!mounted) return [];
    const set = new Set(wishlistIds);
    return data.products.filter((p) => set.has(p.id));
  }, [mounted, wishlistIds, data.products]);

  return (
    <AccountLayoutShell
      title={`Saved Wishlist (${savedProducts.length})`}
      subtitle="Compare saved favorites across brands, try them virtually, or move straight to your bag."
    >
      {savedProducts.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-7 h-7" />}
          title="No saved items yet"
          description="Tap the heart icon on any product across the marketplace or brand storefronts to keep track of styles."
          actionLabel="Browse Discover"
          actionHref="/discover"
        />
      ) : (
        <ProductGrid products={savedProducts} columns={3} />
      )}
    </AccountLayoutShell>
  );
}

