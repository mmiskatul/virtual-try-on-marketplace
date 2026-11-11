'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, ShoppingBag, Heart } from 'lucide-react';
import { MarketplaceProduct } from '../../types';

interface ProductGridProps {
  products: MarketplaceProduct[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  tryOnOnly: boolean;
  onToggleTryOnOnly: (val: boolean) => void;
  sortBy: 'newest' | 'price-asc' | 'price-desc';
  onChangeSortBy: (sort: 'newest' | 'price-asc' | 'price-desc') => void;
  onStartTryOn: (product: MarketplaceProduct) => void;
  onAddToCart: (product: MarketplaceProduct) => void;
  isWishlisted?: (id: string) => boolean;
  onToggleWishlist?: (id: string) => void;
}

export function ProductGrid({
  products,
  selectedCategory,
  onSelectCategory,
  tryOnOnly,
  onToggleTryOnOnly,
  sortBy,
  onChangeSortBy,
  onStartTryOn,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}: ProductGridProps) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200">
        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          {['All', 'Dresses', 'Outerwear', 'Bottoms'].map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 rounded-full transition-all ${
                selectedCategory === cat
                  ? 'bg-white text-gray-900 font-bold shadow-md shadow-black/10'
                  : 'bg-white text-gray-500 hover:text-black border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-full border border-gray-200">
            <input
              type="checkbox"
              checked={tryOnOnly}
              onChange={(e) => onToggleTryOnOnly(e.target.checked)}
              className="rounded accent-black"
            />
            <span className="text-black font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Virtual Try-On Only
            </span>
          </label>

          <select
            value={sortBy}
            onChange={(e) => onChangeSortBy(e.target.value as any)}
            className="bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-700 text-xs focus:outline-none focus:border-black"
          >
            <option value="newest">Featured & Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((product) => {
          const wishlisted = isWishlisted ? isWishlisted(product.id) : false;

          return (
            <div
              key={product.id}
              className="group fashion-card rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-white">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Brand Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-md border border-gray-200/10 text-[10px] font-bold text-gray-900 z-10">
                  <Image
                    src={product.brandLogo}
                    alt={product.brandName}
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5 rounded-full object-cover"
                  />
                  <span>{product.brandName}</span>
                </div>

                {/* Optimistic Wishlist Button */}
                <button
                  type="button"
                  onClick={() => onToggleWishlist?.(product.id)}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-10 ${
                    wishlisted
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 scale-110'
                      : 'bg-white/70 text-gray-500 hover:text-black border border-gray-200/10 hover:scale-105'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                </button>

                {/* Try On Button */}
                {product.isTryOnEligible && (
                  <button
                    onClick={() => onStartTryOn(product)}
                    className="absolute bottom-3 left-3 right-3 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-xs backdrop-blur-md shadow-lg shadow-black/10 flex items-center justify-center gap-2 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-black" />
                    Try On Virtually
                  </button>
                )}
              </div>

              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-black transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{product.fabric}</p>
                  </div>
                  <span className="font-extrabold text-base text-black">${product.price}</span>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex gap-1">
                    {['S', 'M', 'L'].map((s) => (
                      <span
                        key={s}
                        className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] text-gray-500 font-mono"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => onAddToCart(product)}
                    className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 hover:text-black text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Add to Bag
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
