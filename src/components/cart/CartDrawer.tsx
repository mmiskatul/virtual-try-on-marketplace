'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bookmark, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { CartItem } from '../../types';
import { groupCartItemsByBrand } from '../../services';
import { useCartStore } from '../../stores/useCartStore';
import { SafeImage } from '../ui/States';
import { Button } from '../ui/button';

interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  cart?: CartItem[];
  onRemoveItem?: (index: number) => void;
}

export function CartDrawer({ isOpen: propOpen, onClose: propClose }: CartDrawerProps) {
  const storeOpen = useCartStore((s) => s.isOpen);
  const closeDrawer = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const saveForLater = useCartStore((s) => s.saveForLater);

  const open = propOpen ?? storeOpen;
  const close = propClose ?? closeDrawer;

  if (!open) return null;

  const groups = groupCartItemsByBrand(items);
  const subtotal = groups.reduce((sum, g) => sum + g.subtotal, 0);
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/45 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white border-l border-stone-200 shadow-2xl flex flex-col justify-between p-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-stone-950" />
            <h3 className="font-serif font-bold text-lg text-stone-950">
              Shopping Bag ({totalCount})
            </h3>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close bag drawer"
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-semibold text-stone-800">Your shopping bag is empty</p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Discover multi-brand fashion pieces and try them virtually before adding to bag.
              </p>
              <Link href="/discover" onClick={close}>
                <Button size="sm" className="mt-2">
                  Explore Marketplace
                </Button>
              </Link>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.brandSlug} className="rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200/70 pb-2">
                  <Link
                    href={`/brands/${group.brandSlug}`}
                    onClick={close}
                    className="text-xs font-bold text-stone-900 hover:underline"
                  >
                    {group.brandName}
                  </Link>
                  <span className="text-[10px] text-stone-500">
                    {group.shippingFee === 0 ? 'Free shipping' : `Est. shipping $${group.shippingFee}`}
                  </span>
                </div>

                {group.items.map((item) => {
                  const globalIdx = items.findIndex((x) => x === item);
                  return (
                    <div key={`${item.product.id}_${item.size}_${item.color}`} className="flex gap-3 bg-white p-2.5 rounded-xl border border-stone-100">
                      <div className="relative w-14 h-18 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                        <SafeImage src={item.product.image} alt={item.product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={close}
                          className="text-xs font-bold text-stone-900 hover:underline block truncate"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-[11px] text-stone-500">
                          Size {item.size}{item.color ? ` • ${item.color}` : ''}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <div className="inline-flex items-center border border-stone-200 rounded-lg">
                            <button
                              type="button"
                              onClick={() => updateQuantity(globalIdx, item.quantity - 1)}
                              className="p-1 text-stone-600 hover:text-stone-950"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(globalIdx, item.quantity + 1)}
                              className="p-1 text-stone-600 hover:text-stone-950"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs font-extrabold text-stone-950">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between items-end">
                        <button
                          type="button"
                          onClick={() => removeFromCart(globalIdx)}
                          title="Remove"
                          className="text-stone-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => saveForLater(globalIdx)}
                          title="Save for later"
                          className="text-stone-400 hover:text-stone-900 p-1"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-stone-200 pt-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>{groups.length} Brand Seller{groups.length > 1 ? 's' : ''}</span>
              <span className="text-base font-extrabold text-stone-950">
                Subtotal: ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Link href="/cart" onClick={close}>
                <Button variant="outline" className="w-full h-11 rounded-2xl text-xs font-bold">
                  View Full Cart
                </Button>
              </Link>
              <Link href="/checkout" onClick={close}>
                <Button className="w-full h-11 rounded-2xl text-xs font-bold gap-1.5">
                  Checkout <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
