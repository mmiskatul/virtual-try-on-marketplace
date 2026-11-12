'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, Sparkles, Star, X } from 'lucide-react';
import { MarketplaceProduct } from '../../types';
import { SafeImage } from '../ui/States';
import { Button } from '../ui/button';

interface ProductQuickViewModalProps {
  product: MarketplaceProduct | null;
  onClose: () => void;
  onAddToCart: (product: MarketplaceProduct, size: string, color: string) => void;
  onStartTryOn: (product: MarketplaceProduct) => void;
}

export function ProductQuickViewModal({
  product,
  onClose,
  onAddToCart,
  onStartTryOn,
}: ProductQuickViewModalProps) {
  const [size, setSize] = useState('M');
  const [color, setColor] = useState('Classic');

  useEffect(() => {
    if (product) {
      setSize(product.sizes?.[0] || 'M');
      setColor(product.colors?.[0]?.name || 'Classic');
    }
  }, [product]);

  if (!product) return null;

  const selectedColorObj = product.colors?.find((c) => c.name === color);
  const displayImage = selectedColorObj?.image || product.image;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-stone-200 max-w-3xl w-full overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-stone-100 text-stone-700 flex items-center justify-center shadow"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image */}
        <div className="relative aspect-[3/4] bg-stone-100">
          <SafeImage src={displayImage} alt={product.name} fill className="object-cover" />
        </div>

        {/* Details */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/brands/${product.brandSlug}`}
                onClick={onClose}
                className="text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-950"
              >
                {product.brandName}
              </Link>
              <div className="flex items-center gap-1 text-xs font-semibold text-stone-800">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-stone-400">({product.reviewCount})</span>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-stone-950">{product.name}</h3>
              <p className="text-xs text-stone-500 mt-1">{product.fabric}</p>
            </div>

            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-extrabold text-stone-950">৳{product.price}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-sm text-stone-400 line-through">৳{product.compareAtPrice}</span>
                  <span className="text-xs font-bold text-rose-600">Save {product.discountPercent}%</span>
                </>
              )}
            </div>

            <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Color: <span className="text-stone-900">{color}</span>
                </span>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColor(c.name)}
                      className={`w-7 h-7 rounded-full border transition-all ${
                        color === c.name
                          ? 'ring-2 ring-stone-950 ring-offset-2 border-stone-950'
                          : 'border-stone-300'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Select Size
              </span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                      size === s
                        ? 'bg-stone-950 text-white border-stone-950'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-900'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{product.inStock ? 'In stock & ready to ship' : 'Currently unavailable'}</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                disabled={!product.inStock}
                onClick={() => {
                  onAddToCart(product, size, color);
                  onClose();
                }}
                className="w-full gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </Button>

              {product.isTryOnEligible && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose();
                    onStartTryOn(product);
                  }}
                  className="w-full gap-1.5 border-stone-900 text-stone-950"
                >
                  <Sparkles className="w-4 h-4" />
                  Try It On
                </Button>
              )}
            </div>

            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="block text-center text-xs font-semibold text-stone-600 hover:text-stone-950 underline underline-offset-4 pt-1"
            >
              View Full Product Details & Reviews
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

