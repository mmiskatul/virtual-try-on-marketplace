'use client';

import React, { useState } from 'react';
import { MarketplaceProduct } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { ProductQuickViewModal } from '../product/ProductQuickViewModal';
import { useCartStore } from '../../stores/useCartStore';
import { useMarketplaceStore } from '../../stores/useMarketplaceStore';
import { useTryOnStore } from '../../stores/useTryOnStore';
import { EmptyState } from '../ui/States';

interface ProductGridProps {
  products: MarketplaceProduct[];
  brandStorefrontContextSlug?: string;
  columns?: 3 | 4;
  emptyTitle?: string;
  emptyDescription?: string;
  onResetEmpty?: () => void;
}

export function ProductGrid({
  products,
  brandStorefrontContextSlug,
  columns = 4,
  emptyTitle = 'No products match these filters',
  emptyDescription = 'Try clearing one or more filters to browse more garments.',
  onResetEmpty,
}: ProductGridProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<MarketplaceProduct | null>(null);
  const wishlistIds = useMarketplaceStore((s) => s.wishlistIds);
  const toggleWishlist = useMarketplaceStore((s) => s.toggleWishlist);
  const addToCart = useCartStore((s) => s.addToCart);
  const startTryOn = useTryOnStore((s) => s.startTryOn);

  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onResetEmpty ? 'Reset Filters' : undefined}
        onAction={onResetEmpty}
      />
    );
  }

  const gridClasses =
    columns === 3
      ? 'grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6'
      : 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6';

  return (
    <>
      <div className={gridClasses}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isWishlisted={wishlistIds.includes(product.id)}
            onToggleWishlist={toggleWishlist}
            onStartTryOn={(p) =>
              startTryOn(p, { scopedBrandSlug: brandStorefrontContextSlug })
            }
            onAddToCart={addToCart}
            onQuickView={setQuickViewProduct}
            brandStorefrontContextSlug={brandStorefrontContextSlug}
          />
        ))}
      </div>

      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={addToCart}
        onStartTryOn={(p) =>
          startTryOn(p, { scopedBrandSlug: brandStorefrontContextSlug })
        }
      />
    </>
  );
}
