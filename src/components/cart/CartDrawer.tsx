'use client';

import React from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShoppingBag, ChevronRight, CreditCard, Check } from 'lucide-react';
import { CartItem, CustomerUser } from '../../types';
import { shippingAddressSchema, ShippingAddressFormValues } from '../../lib/schemas';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemoveItem: (index: number) => void;
  checkoutStep: 'cart' | 'shipping' | 'confirmed';
  onSetCheckoutStep: (step: 'cart' | 'shipping' | 'confirmed') => void;
  customer: CustomerUser | null;
  confirmedOrderId: string | null;
  onCompleteCheckout: (data: ShippingAddressFormValues) => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onRemoveItem,
  checkoutStep,
  onSetCheckoutStep,
  customer,
  confirmedOrderId,
  onCompleteCheckout
}: CartDrawerProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ShippingAddressFormValues>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullName: customer?.name || 'Sarah Miller',
      email: customer?.email || 'sarah.miller@example.com',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      postalCode: '97477',
      country: 'United States'
    }
  });

  if (!isOpen) return null;

  const cartBrandSet = new Set(cart.map((i) => i.product.brandName));
  const isSingleSellerCart = cartBrandSet.size <= 1;
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const onSubmitShipping = (data: ShippingAddressFormValues) => {
    onCompleteCheckout(data);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-white/80 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-md w-full fashion-glass border-l border-gray-200 shadow-2xl flex flex-col justify-between p-6">
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-black" />
              <h3 className="font-black text-base text-gray-900">Your Shopping Bag ({cart.length})</h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">✕</button>
          </div>

          {/* Single Seller Architecture Enforcement Warning */}
          {!isSingleSellerCart && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-800 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <span>⚠️ Single-Seller Checkout Policy</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                Your bag contains items from multiple distinct brand merchants. Each order is fulfilled directly by the independent brand. Please separate your order to checkout with one brand at a time.
              </p>
            </div>
          )}

          {/* Items List */}
          {checkoutStep === 'cart' && (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs">
                  Your shopping bag is empty. Explore designer collections to start trying on!
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white/90 border border-gray-200 flex items-center justify-between gap-3">
                    <Image src={item.product.image} alt={item.product.name} width={56} height={56} className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-black font-bold uppercase">{item.product.brandName}</span>
                      <p className="text-xs font-bold text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">Size: {item.size} • Qty: {item.quantity}</p>
                      <p className="text-xs font-extrabold text-gray-900 mt-1">${item.product.price * item.quantity}</p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="text-gray-500 hover:text-rose-600 p-1 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Step 2: Shipping Details Form with React Hook Form & Zod */}
          {checkoutStep === 'shipping' && (
            <form id="shipping-form" onSubmit={handleSubmit(onSubmitShipping)} className="space-y-3 text-xs">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm text-gray-900">Shipping & Delivery Details</h4>
                <span className="text-[10px] text-black font-mono">Validated via Zod</span>
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Full Recipient Name *</label>
                <Input
                  {...register('fullName')}
                  className={errors.fullName ? 'border-rose-500 focus-visible:ring-rose-500' : ''}
                />
                {errors.fullName && (
                  <p className="text-rose-600 text-[11px] mt-1 font-medium">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Order Confirmation Email *</label>
                <Input
                  type="email"
                  {...register('email')}
                  className={errors.email ? 'border-rose-500 focus-visible:ring-rose-500' : ''}
                />
                {errors.email && (
                  <p className="text-rose-600 text-[11px] mt-1 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Shipping Address *</label>
                <Input
                  {...register('address')}
                  className={errors.address ? 'border-rose-500 focus-visible:ring-rose-500' : ''}
                />
                {errors.address && (
                  <p className="text-rose-600 text-[11px] mt-1 font-medium">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-500 mb-1">City *</label>
                  <Input
                    {...register('city')}
                    className={errors.city ? 'border-rose-500 focus-visible:ring-rose-500' : ''}
                  />
                  {errors.city && (
                    <p className="text-rose-600 text-[11px] mt-1 font-medium">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">Postal Code *</label>
                  <Input
                    {...register('postalCode')}
                    className={`font-mono ${errors.postalCode ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
                  />
                  {errors.postalCode && (
                    <p className="text-rose-600 text-[11px] mt-1 font-medium">{errors.postalCode.message}</p>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* Step 3: Order Confirmed */}
          {checkoutStep === 'confirmed' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto ring-4 ring-emerald-500/10">
                <Check className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-gray-900">Order Confirmed!</h4>
                <p className="text-xs text-gray-500">Order Ref: <span className="text-emerald-600 font-mono font-bold">{confirmedOrderId}</span></p>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed px-4">
                Your order was routed directly to the brand seller. Stock has been concurrency-safely deducted and order notification dispatched.
              </p>
              <Button
                onClick={() => {
                  onClose();
                  onSetCheckoutStep('cart');
                }}
                className="bg-black border border-gray-200 text-white font-bold text-xs hover:bg-gray-800"
              >
                Continue Shopping
              </Button>
            </div>
          )}
        </div>

        {/* Bottom Checkout Actions */}
        {checkoutStep !== 'confirmed' && (
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Estimated Subtotal</span>
              <span className="font-black text-lg text-gray-900">${cartSubtotal}</span>
            </div>

            {checkoutStep === 'cart' ? (
              <Button
                disabled={cart.length === 0 || !isSingleSellerCart}
                onClick={() => onSetCheckoutStep('shipping')}
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  cart.length === 0 || !isSingleSellerCart
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-black hover:bg-gray-800 text-white shadow-lg shadow-black/10'
                }`}
              >
                Proceed to Shipping <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                form="shipping-form"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" /> Place Confirmed Order (${cartSubtotal})
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
