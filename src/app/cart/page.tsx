'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bookmark,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';
import { groupCartItemsByBrand } from '../../services';
import { useCartStore } from '../../stores/useCartStore';
import { useMounted } from '../../hooks/useMounted';
import { MarketplaceShell } from '../../components/layout/MarketplaceShell';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { EmptyState, SafeImage } from '../../components/ui/States';
import { Button } from '../../components/ui/button';
import { lineUnitPrice } from '../../lib/pricing';

export default function CartPage() {
  const mounted = useMounted();
  const items = useCartStore((s) => s.items);
  const savedForLater = useCartStore((s) => s.savedForLater);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const saveForLater = useCartStore((s) => s.saveForLater);
  const moveToCartFromSaved = useCartStore((s) => s.moveToCartFromSaved);
  const removeSavedForLater = useCartStore((s) => s.removeSavedForLater);

  const safeItems = mounted ? items : [];
  const safeSaved = mounted ? savedForLater : [];
  const groups = groupCartItemsByBrand(safeItems);

  const subtotal = groups.reduce((sum, g) => sum + g.subtotal, 0);
  const totalSavings = safeItems.reduce((sum, i) => {
    const unit = lineUnitPrice(i);
    const compare = i.product.compareAtPrice || unit;
    return sum + Math.max(0, compare - unit) * i.quantity;
  }, 0);
  const totalShipping = groups.reduce((sum, g) => sum + g.shippingFee, 0);
  const estimatedTotal = Number((subtotal + totalShipping).toFixed(2));
  const totalItemCount = safeItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <MarketplaceShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
        <Breadcrumb items={[{ label: 'Shopping Cart' }]} />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950">
              Your Shopping Cart ({totalItemCount})
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Items are grouped cleanly by brand seller so each boutique&apos;s delivery and return policies stay clear.
            </p>
          </div>
          <Link
            href="/discover"
            className="text-xs font-bold underline underline-offset-4 text-stone-900"
          >
            Continue Shopping →
          </Link>
        </div>

        {safeItems.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="w-7 h-7" />}
            title="Your shopping cart is empty"
            description="Explore independent designer brands, preview garments via virtual try-on, and add your favorite sizes to cart."
            actionLabel="Explore Marketplace"
            actionHref="/discover"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Grouped Cart Items */}
            <div className="lg:col-span-8 space-y-6">
              {groups.map((group) => (
                <section
                  key={group.brandSlug}
                  className="rounded-3xl border border-stone-200 bg-white overflow-hidden"
                >
                  {/* Brand Seller Header */}
                  <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                    <Link
                      href={`/brands/${group.brandSlug}`}
                      className="flex items-center gap-2.5 group"
                    >
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-stone-200 bg-white">
                        <SafeImage src={group.brandLogo} alt={group.brandName} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-950 group-hover:underline">
                          Sold &amp; Fulfilled by {group.brandName}
                        </p>
                        <p className="text-[11px] text-stone-500 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1">
                            <Truck className="w-3 h-3" /> {group.deliveryEstimate}
                          </span>
                          <span>•</span>
                          <span>{group.returnPolicy}</span>
                        </p>
                      </div>
                    </Link>

                    <span className="text-xs font-bold text-stone-800">
                      {group.shippingFee === 0
                        ? 'Complimentary Shipping'
                        : `Brand Shipping: ৳${group.shippingFee.toFixed(2)}`}
                    </span>
                  </div>

                  {/* Brand Items */}
                  <div className="divide-y divide-stone-100">
                    {group.items.map((item) => {
                      const globalIdx = safeItems.findIndex((x) => x === item);
                      return (
                        <div
                          key={`${item.product.id}_${item.size}_${item.color}`}
                          className="p-5 flex flex-col sm:flex-row gap-4 justify-between"
                        >
                          <div className="flex gap-4">
                            <Link
                              href={`/products/${item.product.slug}`}
                              className="relative w-24 h-28 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0"
                            >
                              <SafeImage src={item.product.image} alt={item.product.name} fill className="object-cover" />
                            </Link>

                            <div className="space-y-1.5">
                              <Link
                                href={`/products/${item.product.slug}`}
                                className="font-bold text-sm text-stone-950 hover:underline block"
                              >
                                {item.product.name}
                              </Link>
                              <p className="text-xs text-stone-500">
                                Size: <span className="font-semibold text-stone-800">{item.size}</span>
                                {item.color ? ` • Color: ${item.color}` : ''}
                              </p>
                              <div className="flex items-baseline gap-2 pt-0.5">
                                <span className="text-sm font-extrabold text-stone-950">
                                  ৳{lineUnitPrice(item)}
                                </span>
                                {item.product.compareAtPrice &&
                                  item.product.compareAtPrice > lineUnitPrice(item) && (
                                    <span className="text-xs text-stone-400 line-through">
                                      ৳{item.product.compareAtPrice}
                                    </span>
                                  )}
                              </div>

                              <div className="flex items-center gap-3 pt-2 text-xs">
                                <button
                                  type="button"
                                  onClick={() => saveForLater(globalIdx)}
                                  className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-950 font-semibold"
                                >
                                  <Bookmark className="w-3.5 h-3.5" /> Save for Later
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(globalIdx)}
                                  className="inline-flex items-center gap-1 text-stone-500 hover:text-rose-600 font-semibold"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Remove
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                            <div className="inline-flex items-center border border-stone-200 rounded-xl bg-stone-50">
                              <button
                                type="button"
                                onClick={() => updateQuantity(globalIdx, item.quantity - 1)}
                                className="p-2 text-stone-700 hover:text-stone-950"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 text-xs font-bold">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(globalIdx, item.quantity + 1)}
                                className="p-2 text-stone-700 hover:text-stone-950"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <span className="text-base font-extrabold text-stone-950">
                              ${(lineUnitPrice(item) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            {/* Order Summary */}
            <aside className="lg:col-span-4 rounded-3xl border border-stone-200 bg-white p-6 space-y-5 sticky top-20">
              <h2 className="font-serif text-xl font-bold text-stone-950 border-b border-stone-100 pb-3">
                Order Summary
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Items ({totalItemCount} across {groups.length} brand{groups.length > 1 ? 's' : ''})</span>
                  <span className="font-bold text-stone-950">৳{subtotal.toFixed(2)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Markdown Discount</span>
                    <span>-৳{totalSavings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Delivery Estimate</span>
                  <span className="font-bold text-stone-950">
                    {totalShipping === 0 ? 'FREE' : `৳${totalShipping.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-4 flex items-center justify-between">
                <span className="text-sm font-bold text-stone-950">Estimated Total</span>
                <span className="text-2xl font-extrabold text-stone-950">
                  ৳{estimatedTotal.toFixed(2)}
                </span>
              </div>

              <Link href="/checkout" className="block">
                <Button className="w-full h-12 rounded-2xl text-xs font-bold gap-2">
                  Proceed to Multi-Step Checkout <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <p className="text-[11px] text-stone-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Supports bKash, Nagad, Cards, &amp; Cash on Delivery. Have a discount code? Enter it at checkout.</span>
              </p>
            </aside>
          </div>
        )}

        {/* Saved For Later */}
        {safeSaved.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-stone-200">
            <h2 className="font-serif text-xl font-bold text-stone-950">
              Saved for Later ({safeSaved.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {safeSaved.map((s, idx) => (
                <div
                  key={`${s.product.id}_${s.size}_${idx}`}
                  className="p-4 rounded-2xl border border-stone-200 bg-white flex items-center gap-3.5"
                >
                  <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                    <SafeImage src={s.product.image} alt={s.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-[10px] font-bold uppercase text-stone-500">{s.product.brandName}</p>
                    <p className="text-xs font-bold text-stone-900 truncate">{s.product.name}</p>
                    <p className="text-xs font-extrabold">৳{lineUnitPrice(s)}</p>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => moveToCartFromSaved(idx)}
                        className="text-[11px] font-bold text-stone-950 underline"
                      >
                        Move to Cart
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSavedForLater(idx)}
                        className="text-[11px] text-stone-400 hover:text-rose-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </MarketplaceShell>
  );
}

