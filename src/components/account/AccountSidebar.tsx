'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Bell,
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';
import { MarketplaceShell } from '../layout/MarketplaceShell';
import { Breadcrumb } from '../layout/Breadcrumb';
import { SafeImage } from '../ui/States';

const ACCOUNT_NAV = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/try-on-history', label: 'Try-On History', icon: Sparkles },
  { href: '/account/profile', label: 'Profile & Addresses', icon: User },
  { href: '/account/settings', label: 'Settings & Privacy', icon: Settings },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

export function AccountLayoutShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <MarketplaceShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        <Breadcrumb
          items={[
            { label: 'Account', href: '/account' },
            ...(pathname !== '/account' ? [{ label: title }] : []),
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Account Sidebar */}
          <aside className="lg:col-span-3 rounded-3xl border border-stone-200 bg-white p-5 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-stone-950 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {session?.user?.image ? (
                  <SafeImage
                    src={session.user.image}
                    alt={session?.user?.name || 'Customer'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>
                    {(session?.user?.name || session?.user?.email || 'U')
                      .trim()
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-stone-950 truncate">
                  {session?.user?.name || 'Customer Account'}
                </p>
                <p className="text-[11px] text-stone-500 truncate">
                  {session?.user?.email || 'Verified Shopper'}
                </p>
              </div>
            </div>

            <nav className="flex lg:flex-col overflow-x-auto no-scrollbar gap-1.5 text-xs font-semibold">
              {ACCOUNT_NAV.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-stone-950 text-white font-bold'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={async () => {
                  const { logoutMarketplace } = await import('@/lib/logout');
                  await logoutMarketplace({ callbackUrl: '/' });
                }}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl whitespace-nowrap text-rose-600 hover:bg-rose-50 font-bold lg:mt-2 lg:border-t lg:border-stone-100 lg:pt-3"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Main Account Panel */}
          <div className="lg:col-span-9 space-y-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-6">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950">{title}</h1>
              {subtitle && <p className="text-xs text-stone-500 mt-1">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>
    </MarketplaceShell>
  );
}

