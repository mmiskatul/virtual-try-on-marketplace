'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, Heart, ShoppingBag, Sparkles, Star, ShieldCheck } from 'lucide-react';
import { MarketplaceProduct } from '../../types';
import { SafeImage } from '../ui/States';

interface ProductCardProps {
  product: MarketplaceProduct;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
  onStartTryOn?: (product: MarketplaceProduct) => void;
  onAddToCart?: (product: MarketplaceProduct, size?: string, color?: string) => void;
  onQuickView?: (product: MarketplaceProduct) => void;
  brandStorefrontContextSlug?: string;
}

export function ProductCard({
  product,
  isWishlisted = false,
  onToggleWishlist,
  onStartTryOn,
  onAddToCart,
  onQuickView,
  brandStorefrontContextSlug,
}: ProductCardProps) {
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const activeColor = product.colors?.[selectedColorIdx];
  const activeImage = activeColor?.image || product.image;

  const productHref = brandStorefrontContextSlug
    ? `/products/${product.slug}?brand=${encodeURIComponent(brandStorefrontContextSlug)}`
    : `/products/${product.slug}`;

  return (
    <article className="group fashion-card rounded-2xl overflow-hidden flex flex-col justify-between">
      {/* Upper Media Area */}
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
        <Link href={productHref} className="block relative w-full h-full">
          <SafeImage
            src={activeImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10 pointer-events-none">
          {product.discountPercent && product.discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold tracking-wide shadow-sm">
              -{product.discountPercent}%
            </span>
          )}
          {!product.marketplacePublished && product.brandStorefrontPublished && (
            <span className="px-2 py-0.5 rounded-full bg-stone-950/90 text-white text-[10px] font-bold">
              Storefront Exclusive
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2 py-0.5 rounded-full bg-white/95 text-stone-900 border border-stone-200 text-[10px] font-bold">
              New
            </span>
          )}
          {!product.inStock && (
            <span className="px-2 py-0.5 rounded-full bg-stone-800/90 text-white text-[10px] font-semibold">
              Out of Stock
            </span>
          )}
        </div>

        {/* Top-Right Actions (Favorite & Quick View) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          <button
            type="button"
            onClick={() => onToggleWishlist?.(product.id)}
            aria-label={isWishlisted ? 'Remove from favorites' : 'Save to favorites'}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm ${
              isWishlisted
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 text-stone-700 hover:bg-white hover:text-stone-950'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          {onQuickView && (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              aria-label="Quick view product"
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-stone-950 flex items-center justify-center backdrop-blur-md transition-all shadow-sm"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Bottom Try-On Hover Bar */}
        {product.isTryOnEligible && onStartTryOn && (
          <div className="absolute bottom-3 left-3 right-3 z-10 sm:opacity-0 sm:translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
            <button
              type="button"
              onClick={() => onStartTryOn(product)}
              className="w-full py-2.5 px-3 rounded-xl bg-stone-950/95 hover:bg-stone-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Try It On</span>
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Brand Link */}
          <Link
            href={`/brands/${product.brandSlug}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 hover:text-stone-950 transition-colors"
          >
            <span>{product.brandName}</span>
            {product.brandVerified && <ShieldCheck className="w-3 h-3 text-stone-700" />}
          </Link>

          <Link href={productHref} className="block">
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-stone-700 line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Rating & Colors */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1 text-[11px] text-stone-600">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-stone-900">{product.rating.toFixed(1)}</span>
              <span className="text-stone-400">({product.reviewCount})</span>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-1">
                {product.colors.slice(0, 4).map((color, idx) => (
                  <button
                    key={color.name}
                    type="button"
                    title={color.name}
                    onClick={() => setSelectedColorIdx(idx)}
                    className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                      selectedColorIdx === idx
                        ? 'border-stone-950 scale-110 ring-1 ring-stone-950 ring-offset-1'
                        : 'border-stone-300'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Price + Quick Add */}
        <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-stone-950">৳{product.price}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-stone-400 line-through">৳{product.compareAtPrice}</span>
            )}
          </div>

          {onAddToCart && (
            <button
              type="button"
              disabled={!product.inStock}
              onClick={() => onAddToCart(product, product.sizes?.[0], activeColor?.name)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-950 hover:text-white hover:border-stone-950 text-stone-900 text-[11px] font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{product.inStock ? 'Add' : 'Sold Out'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

