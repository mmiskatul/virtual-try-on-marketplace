'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowRight, Heart, Package, Sparkles, Store } from 'lucide-react';
import { useMarketplaceStore } from '../../stores/useMarketplaceStore';
import { useMounted } from '../../hooks/useMounted';
import { AccountLayoutShell } from '../../components/account/AccountSidebar';
import { SafeImage } from '../../components/ui/States';

export default function AccountDashboardPage() {
  const mounted = useMounted();
  const { data: session } = useSession();
  const orders = useMarketplaceStore((s) => s.orders);
  const wishlistIds = useMarketplaceStore((s) => s.wishlistIds);
  const tryOnHistory = useMarketplaceStore((s) => s.tryOnHistory);
  const followedBrands = useMarketplaceStore((s) => s.followedBrandSlugs);

  const safeOrders = mounted ? orders : [];
  const safeWish = mounted ? wishlistIds : [];
  const safeTryOn = mounted ? tryOnHistory : [];
  const safeFollows = mounted ? followedBrands : [];

  return (
    <AccountLayoutShell
      title={`Welcome back${session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}`}
      subtitle="Manage your multi-brand orders, saved favorites, virtual try-on history, and privacy preferences."
    >
      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Orders Placed', count: safeOrders.length, href: '/account/orders', icon: Package },
          { label: 'Saved Items', count: safeWish.length, href: '/account/wishlist', icon: Heart },
          { label: 'Try-On Looks', count: safeTryOn.length, href: '/account/try-on-history', icon: Sparkles },
          { label: 'Followed Brands', count: safeFollows.length, href: '/brands', icon: Store },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-2xl border border-stone-200 bg-white p-4 hover:border-stone-950 transition-colors space-y-2"
            >
              <Icon className="w-5 h-5 text-stone-700" />
              <p className="font-serif text-2xl font-bold text-stone-950">{stat.count}</p>
              <p className="text-xs font-semibold text-stone-500">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent Try-On History & Recent Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-stone-950">Recent Orders</h2>
            <Link href="/account/orders" className="text-xs font-bold underline">
              View All
            </Link>
          </div>
          {safeOrders.length === 0 ? (
            <p className="text-xs text-stone-500">No recent orders placed yet.</p>
          ) : (
            <div className="space-y-3">
              {safeOrders.slice(0, 3).map((ord) => (
                <div key={ord.id} className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-mono font-bold text-stone-950">{ord.id}</p>
                    <p className="text-stone-500">{ord.groups.length} brand parcel(s) • {ord.status}</p>
                  </div>
                  <span className="font-extrabold text-stone-950">${ord.totalAmount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-stone-950">Latest Try-On Looks</h2>
            <Link href="/account/try-on-history" className="text-xs font-bold underline">
              Open Gallery
            </Link>
          </div>
          {safeTryOn.length === 0 ? (
            <div className="space-y-2 text-xs text-stone-500">
              <p>You haven&apos;t saved any virtual try-on previews yet.</p>
              <Link href="/try-on" className="inline-flex items-center gap-1 font-bold text-stone-950 underline">
                Open Try-On Studio <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {safeTryOn.slice(0, 3).map((rec) => (
                <Link
                  key={rec.id}
                  href={`/products/${rec.productSlug}`}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden border border-stone-200 bg-stone-100"
                >
                  <SafeImage src={rec.resultImageUrl} alt={rec.productName} fill className="object-cover" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AccountLayoutShell>
  );
}

