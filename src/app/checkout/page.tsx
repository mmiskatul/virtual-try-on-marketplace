'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  ShieldCheck,
  Smartphone,
  Truck,
} from 'lucide-react';
import { CustomerOrder, PaymentMethodId } from '../../types';
import {
  evaluatePromoCode,
  getAvailablePaymentMethods,
  groupCartItemsByBrand,
  submitMultiBrandCheckout,
} from '../../services';
import { useCartStore } from '../../stores/useCartStore';
import { useMarketplaceStore } from '../../stores/useMarketplaceStore';
import { useMounted } from '../../hooks/useMounted';
import { MarketplaceShell } from '../../components/layout/MarketplaceShell';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { EmptyState, SafeImage } from '../../components/ui/States';
import { Button } from '../../components/ui/button';

type CheckoutStep = 1 | 2 | 3 | 4 | 5 | 6;

export default function CheckoutPage() {
  const mounted = useMounted();
  const { data: session } = useSession();

  const items = useCartStore((s) => s.items);
  const confirmOrder = useCartStore((s) => s.confirmOrder);

  const addresses = useMarketplaceStore((s) => s.addresses);
  const addAddress = useMarketplaceStore((s) => s.addAddress);
  const addOrder = useMarketplaceStore((s) => s.addOrder);
  const pushNotification = useMarketplaceStore((s) => s.pushNotification);

  const [step, setStep] = useState<CheckoutStep>(1);

  // Step 1 & 2 state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+880 1711-000000');
  const [street, setStreet] = useState('House 24, Road 11, Banani');
  const [city, setCity] = useState('Dhaka');
  const [stateRegion, setStateRegion] = useState('Dhaka');
  const [postalCode, setPostalCode] = useState('1213');
  const [country, setCountry] = useState('Bangladesh');
  const [saveNewAddress, setSaveNewAddress] = useState(true);

  // Step 3: Delivery
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express' | 'same-day'>('standard');

  // Step 5: Payment & Promo
  const paymentMethods = getAvailablePaymentMethods();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('bkash');
  const [walletRef, setWalletRef] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoMsg, setPromoMsg] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<CustomerOrder | null>(null);

  useEffect(() => {
    if (session?.user) {
      if (!fullName && session.user.name) setFullName(session.user.name);
      if (!email && session.user.email) setEmail(session.user.email);
    } else if (addresses[0]) {
      if (!fullName) setFullName(addresses[0].fullName);
      if (!email) setEmail(addresses[0].email);
    }
  }, [session?.user, addresses, fullName, email]);

  const safeItems = mounted ? items : [];
  const groups = groupCartItemsByBrand(safeItems);
  const subtotal = groups.reduce((sum, g) => sum + g.subtotal, 0);
  const baseShipping = groups.reduce((sum, g) => sum + g.shippingFee, 0);
  const deliveryUpgradeFee = deliveryMethod === 'same-day' ? 10 : deliveryMethod === 'express' ? 6 : 0;
  const promoEval = evaluatePromoCode(appliedPromo, subtotal);
  const discountAmount = promoEval.valid ? promoEval.discountAmount : 0;
  const totalShipping = baseShipping + deliveryUpgradeFee;
  const taxAmount = Number(((subtotal - discountAmount) * 0.05).toFixed(2));
  const grandTotal = Number((subtotal - discountAmount + totalShipping + taxAmount).toFixed(2));

  const applySavedAddress = (addrId: string) => {
    const found = addresses.find((a) => a.id === addrId);
    if (!found) return;
    setFullName(found.fullName);
    setPhone(found.phone);
    setEmail(found.email);
    setStreet(found.street);
    setCity(found.city);
    setStateRegion(found.state);
    setPostalCode(found.postalCode);
    setCountry(found.country);
  };

  const handleApplyPromo = () => {
    const res = evaluatePromoCode(promoInput, subtotal);
    if (res.valid) {
      setAppliedPromo(promoInput.trim().toUpperCase());
      setPromoMsg(`Applied ${res.label} — Saved $${res.discountAmount.toFixed(2)}`);
    } else {
      setAppliedPromo('');
      setPromoMsg(res.message || 'Invalid code');
    }
  };

  const handlePlaceOrder = async () => {
    setSubmitError(null);
    if (!fullName.trim() || !email.trim() || !street.trim() || !city.trim()) {
      setSubmitError('Please complete customer details and shipping address first.');
      return;
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && walletRef.trim().length < 6) {
      setSubmitError(`Enter a valid ${paymentMethod.toUpperCase()} account/wallet number to proceed.`);
      return;
    }

    setSubmitting(true);

    const res = await submitMultiBrandCheckout({
      items: safeItems,
      customerEmail: email.trim(),
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        state: stateRegion.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
      },
      deliveryMethod,
      paymentMethod,
      promoCode: appliedPromo || undefined,
    });
    setSubmitting(false);

    if (!res.ok) {
      setSubmitError(res.error);
      return;
    }

    if (saveNewAddress) {
      addAddress({
        label: 'Checkout Address',
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        street: street.trim(),
        city: city.trim(),
        state: stateRegion.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
        isDefault: addresses.length === 0,
      });
    }

    addOrder(res.order);
    confirmOrder(res.order.id);
    pushNotification({
      type: 'order',
      title: `Order ${res.order.id} Confirmed`,
      message: `${res.order.groups.length} brand shipment(s) queued for dispatch.`,
      href: '/account/orders',
    });
    setConfirmedOrder(res.order);
    setStep(6);
  };

  if (step === 6 && confirmedOrder) {
    return (
      <MarketplaceShell>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full space-y-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-8 space-y-6 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                Order Confirmation
              </p>
              <h1 className="font-serif text-3xl font-bold text-stone-950">
                Thank You, {confirmedOrder.shippingAddress.fullName}
              </h1>
              <p className="text-xs text-stone-600">
                Reference: <span className="font-mono font-bold text-stone-950">{confirmedOrder.id}</span> • Payment ({confirmedOrder.paymentMethod.toUpperCase()}):{' '}
                <span className="font-bold">{confirmedOrder.paymentStatus}</span>
              </p>
            </div>

            <div className="text-left space-y-3 border-t border-stone-100 pt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Brand Fulfillment Groups
              </p>
              {confirmedOrder.groups.map((g) => (
                <div key={g.orderRef} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-stone-950">{g.brandName}</p>
                    <p className="text-stone-500">
                      Ref: <span className="font-mono">{g.orderRef}</span> • {g.deliveryMethod} ({g.deliveryEstimate})
                    </p>
                  </div>
                  <span className="font-extrabold text-stone-950">${g.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href="/account/orders">
                <Button className="rounded-full px-6">Track My Orders</Button>
              </Link>
              <Link href="/discover">
                <Button variant="outline" className="rounded-full px-6">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>
      </MarketplaceShell>
    );
  }

  return (
    <MarketplaceShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
        <Breadcrumb items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />

        <div className="space-y-3">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950">
            Secure Multi-Brand Checkout
          </h1>

          {/* 6-Step Progress Bar */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
            {[
              [1, 'Customer Info'],
              [2, 'Shipping Address'],
              [3, 'Delivery Method'],
              [4, 'Order Review'],
              [5, 'Payment'],
              [6, 'Confirmation'],
            ].map(([n, label]) => (
              <button
                key={String(n)}
                type="button"
                disabled={Number(n) === 6}
                onClick={() => Number(n) < 6 && setStep(Number(n) as CheckoutStep)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold border whitespace-nowrap transition-colors ${
                  step === n
                    ? 'bg-stone-950 text-white border-stone-950'
                    : step > Number(n)
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-white text-stone-500 border-stone-200'
                }`}
              >
                {n}. {label}
              </button>
            ))}
          </div>
        </div>

        {safeItems.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            description="Add items to your cart before starting checkout."
            actionLabel="Browse Marketplace"
            actionHref="/discover"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Step Content */}
            <div className="lg:col-span-8 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="font-serif text-2xl font-bold text-stone-950">
                    1. Customer Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-950"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-950"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-stone-700 mb-1">Mobile Phone (for courier updates) *</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-950"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={() => setStep(2)}>Continue to Shipping Address →</Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="font-serif text-2xl font-bold text-stone-950">
                    2. Shipping Address
                  </h2>

                  {addresses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Saved Address Book
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {addresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => applySavedAddress(addr.id)}
                            className="p-3.5 rounded-2xl border border-stone-200 hover:border-stone-950 text-left text-xs space-y-1 transition-colors"
                          >
                            <div className="flex items-center justify-between font-bold text-stone-950">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> {addr.label}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100">Default</span>
                              )}
                            </div>
                            <p className="text-stone-600">{addr.street}, {addr.city}</p>
                            <p className="text-stone-500">{addr.country} {addr.postalCode}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-stone-700 mb-1">Street Address *</label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">City *</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Postal Code *</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">State / Division</label>
                      <input
                        type="text"
                        value={stateRegion}
                        onChange={(e) => setStateRegion(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Country *</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveNewAddress}
                      onChange={(e) => setSaveNewAddress(e.target.checked)}
                      className="rounded accent-stone-950"
                    />
                    Save this address to my account address book
                  </label>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
                    <Button onClick={() => setStep(3)}>Continue to Delivery Method →</Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="font-serif text-2xl font-bold text-stone-950">
                    3. Delivery Method
                  </h2>
                  <div className="space-y-3 text-xs">
                    {[
                      {
                        id: 'standard',
                        name: 'Standard Atelier Courier',
                        desc: 'Estimated 2–4 business days per brand',
                        fee: baseShipping === 0 ? 'Included (Free)' : `$${baseShipping}`,
                      },
                      {
                        id: 'express',
                        name: 'Priority Air Dispatch',
                        desc: 'Tracked 1–2 business days priority parcel',
                        fee: '+$6.00',
                      },
                      {
                        id: 'same-day',
                        name: 'Same-Day Express (Dhaka Metro)',
                        desc: 'Same evening doorstep delivery for local brands',
                        fee: '+$10.00',
                      },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                          deliveryMethod === opt.id
                            ? 'border-stone-950 bg-stone-50'
                            : 'border-stone-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="deliveryMethod"
                            checked={deliveryMethod === opt.id}
                            onChange={() => setDeliveryMethod(opt.id as any)}
                            className="accent-stone-950"
                          />
                          <div>
                            <p className="font-bold text-stone-950 flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5" /> {opt.name}
                            </p>
                            <p className="text-stone-500 mt-0.5">{opt.desc}</p>
                          </div>
                        </div>
                        <span className="font-extrabold text-stone-950">{opt.fee}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
                    <Button onClick={() => setStep(4)}>Review Grouped Order →</Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <h2 className="font-serif text-2xl font-bold text-stone-950">
                    4. Review Order Grouped by Brand
                  </h2>
                  <p className="text-xs text-stone-600">
                    Each brand dispatches and honors returns independently. Review your shipment groups below:
                  </p>

                  <div className="space-y-4">
                    {groups.map((g) => (
                      <div key={g.brandSlug} className="rounded-2xl border border-stone-200 p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2 text-xs">
                          <span className="font-bold text-stone-950">{g.brandName}</span>
                          <span className="text-stone-500">
                            {g.shippingFee === 0 ? 'Free Shipping' : `Shipping $${g.shippingFee}`} • {g.deliveryEstimate}
                          </span>
                        </div>
                        {g.items.map((item) => (
                          <div key={`${item.product.id}_${item.size}`} className="flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative w-11 h-14 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                                <SafeImage src={item.product.image} alt={item.product.name} fill className="object-cover" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-stone-900 truncate">{item.product.name}</p>
                                <p className="text-stone-500">Size {item.size} × {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={() => setStep(3)}>← Back</Button>
                    <Button onClick={() => setStep(5)}>Continue to Payment →</Button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-5">
                  <h2 className="font-serif text-2xl font-bold text-stone-950">
                    5. Payment Method
                  </h2>

                  <div className="space-y-3 text-xs">
                    {paymentMethods.map((pm) => (
                      <label
                        key={pm.id}
                        className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                          paymentMethod === pm.id
                            ? 'border-stone-950 bg-stone-50'
                            : 'border-stone-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === pm.id}
                            onChange={() => setPaymentMethod(pm.id)}
                            className="mt-1 accent-stone-950"
                          />
                          <div>
                            <p className="font-bold text-stone-950 flex items-center gap-2">
                              {pm.id === 'card' ? <CreditCard className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                              {pm.name}
                            </p>
                            <p className="text-stone-500 mt-0.5">{pm.subtitle}</p>
                          </div>
                        </div>
                        {pm.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 text-[10px] font-bold shrink-0">
                            {pm.badge}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>

                  {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                      <label className="block font-bold text-stone-800">
                        {paymentMethod.toUpperCase()} Wallet Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={walletRef}
                        onChange={(e) => setWalletRef(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white"
                      />
                      <p className="text-[11px] text-stone-500">
                        Gateway configuration submits tokenized seller authorization per brand basket.
                      </p>
                    </div>
                  )}

                  {submitError && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={() => setStep(4)}>← Back</Button>
                    <Button
                      disabled={submitting}
                      onClick={handlePlaceOrder}
                      className="px-7 h-11 rounded-2xl text-xs font-bold gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Authorizing Order...
                        </>
                      ) : (
                        <>Place Order • ${grandTotal.toFixed(2)}</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Totals & Promo Code */}
            <aside className="lg:col-span-4 rounded-3xl border border-stone-200 bg-white p-6 space-y-5 sticky top-20">
              <h2 className="font-serif text-xl font-bold text-stone-950 border-b border-stone-100 pb-3">
                Checkout Totals
              </h2>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Merchandise Subtotal</span>
                  <span className="font-bold text-stone-950">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Promo ({appliedPromo})</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Shipping ({groups.length} brand{groups.length > 1 ? 's' : ''})</span>
                  <span className="font-bold text-stone-950">
                    {totalShipping === 0 ? 'FREE' : `$${totalShipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Estimated VAT / Tax (5%)</span>
                  <span className="font-bold text-stone-950">${taxAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-3 flex items-center justify-between">
                <span className="font-bold text-stone-950">Total</span>
                <span className="text-2xl font-extrabold text-stone-950">${grandTotal.toFixed(2)}</span>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo code (try VTRY10)"
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleApplyPromo}>
                    Apply
                  </Button>
                </div>
                {promoMsg && (
                  <p className={`text-[11px] font-semibold ${promoEval.valid ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {promoMsg}
                  </p>
                )}
              </div>

              <p className="text-[11px] text-stone-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                Orders validate item stock &amp; seller status directly against backend before confirmation.
              </p>
            </aside>
          </div>
        )}
      </div>
    </MarketplaceShell>
  );
}

