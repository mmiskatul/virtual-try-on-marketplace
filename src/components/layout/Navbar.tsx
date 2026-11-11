'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Bell,
  ChevronDown,
  Compass,
  Heart,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import { CustomerUser } from '../../types';
import { AuthFlowMode } from '../auth/CustomerEmailFlow';
import { AuthModal } from '../ui/AuthModal';
import { AnnouncementBar } from './AnnouncementBar';
import { useCartStore } from '../../stores/useCartStore';
import { useMarketplaceStore } from '../../stores/useMarketplaceStore';
import { useMounted } from '../../hooks/useMounted';

interface NavbarProps {
  search?: string;
  onSearchChange?: (val: string) => void;
  customer?: CustomerUser | null;
  cartCount?: number;
  onOpenCart?: () => void;
}

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Discover', href: '/discover' },
  { label: 'Categories', href: '/categories' },
  { label: 'Brands', href: '/brands' },
  { label: 'New Arrivals', href: '/discover?productType=new' },
  { label: 'Collections', href: '/collections' },
];

const POPULAR_SEARCHES = ['Silk Slip Dress', 'Jamdani Panjabi', 'Oversized Blazer', 'Cotton Saree', 'Boxy Hoodie'];

export function Navbar({
  search: controlledSearch,
  onSearchChange,
  cartCount: propCartCount,
  onOpenCart,
}: NavbarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useMounted();
  const { data: session } = useSession();

  const storeCartItems = useCartStore((s) => s.items);
  const openCartDrawer = useCartStore((s) => s.openCart);
  const setCheckoutStep = useCartStore((s) => s.setCheckoutStep);

  const wishlistIds = useMarketplaceStore((s) => s.wishlistIds);
  const tryOnHistory = useMarketplaceStore((s) => s.tryOnHistory);
  const orders = useMarketplaceStore((s) => s.orders);
  const notifications = useMarketplaceStore((s) => s.notifications);
  const recentSearches = useMarketplaceStore((s) => s.recentSearches);
  const addRecentSearch = useMarketplaceStore((s) => s.addRecentSearch);
  const markNotificationRead = useMarketplaceStore((s) => s.markNotificationRead);

  const [localSearch, setLocalSearch] = useState(controlledSearch || '');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthFlowMode>('login');

  const openAuthModal = (mode: AuthFlowMode) => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    setMobileMenuOpen(false);
    setAccountOpen(false);
    setNotifOpen(false);
  };

  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const notifWrapperRef = useRef<HTMLDivElement>(null);
  const accountWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof controlledSearch === 'string') {
      setLocalSearch(controlledSearch);
    }
  }, [controlledSearch]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(target)) {
        setSearchFocused(false);
      }
      if (notifWrapperRef.current && !notifWrapperRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (accountWrapperRef.current && !accountWrapperRef.current.contains(target)) {
        setAccountOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchFocused(false);
        setNotifOpen(false);
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const totalBagCount = mounted
    ? propCartCount ?? storeCartItems.reduce((sum, item) => sum + item.quantity, 0)
    : 0;
  const wishlistCount = mounted ? wishlistIds.length : 0;
  const tryOnCount = mounted ? tryOnHistory.length : 0;
  const ordersCount = mounted ? orders.length : 0;
  const unreadNotifs = mounted ? notifications.filter((n) => !n.read).length : 0;

  const userDisplayName =
    session?.user?.name?.trim() ||
    session?.user?.email?.split('@')[0] ||
    'Account';
  const userInitial = userDisplayName.charAt(0).toUpperCase() || 'U';

  const handleSearchSubmit = (queryText?: string) => {
    const q = (queryText ?? localSearch).trim();
    if (q) addRecentSearch(q);
    setSearchFocused(false);
    setMobileMenuOpen(false);
    if (onSearchChange && pathname === '/discover') {
      onSearchChange(q);
    } else {
      router.push(q ? `/discover?q=${encodeURIComponent(q)}` : '/discover');
    }
  };

  const handleOpenCart = () => {
    if (onOpenCart) {
      onOpenCart();
    } else {
      setCheckoutStep('cart');
      openCartDrawer();
    }
  };

  return (
    <>
      <AnnouncementBar />

      <header className="sticky top-0 z-40 fashion-glass border-b border-stone-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile Trigger + Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-xl text-stone-700 hover:bg-stone-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-stone-950 flex items-center justify-center font-serif font-bold text-white text-base shadow-sm group-hover:scale-105 transition-transform">
                V
              </div>
              <div className="leading-tight">
                <span className="font-serif font-bold tracking-[0.14em] text-base sm:text-lg text-stone-950 block">
                  V-TRY
                </span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-stone-500 font-semibold hidden sm:block">
                  Fashion Marketplace
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Editorial Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5 text-xs font-semibold text-stone-600 shrink-0">
            {NAV_LINKS.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href.split('?')[0]);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`py-1.5 transition-colors whitespace-nowrap ${
                    active ? 'text-stone-950 font-bold' : 'hover:text-stone-950'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/try-on"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                pathname.startsWith('/try-on')
                  ? 'bg-stone-950 text-white border-stone-950'
                  : 'bg-stone-100 text-stone-900 border-stone-200 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Try-On Studio</span>
            </Link>
          </nav>

          {/* Right: Search + Notifications + Favorites + Cart + Account */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search Box */}
            <div ref={searchWrapperRef} className="relative hidden md:block w-40 lg:w-44 xl:w-56 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchSubmit();
                }}
                className="relative"
              >
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={localSearch}
                  onFocus={() => setSearchFocused(true)}
                  onChange={(e) => {
                    setLocalSearch(e.target.value);
                    if (onSearchChange) onSearchChange(e.target.value);
                  }}
                  placeholder="Search styles, brands..."
                  className="w-full pl-9 pr-7 py-2 bg-stone-100/80 border border-stone-200 rounded-full text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
                />
                {localSearch && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                      setLocalSearch('');
                      if (onSearchChange) onSearchChange('');
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {searchFocused && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl p-3.5 space-y-3 z-50">
                  {mounted && recentSearches.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                        Recent Searches
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => {
                              setLocalSearch(q);
                              handleSearchSubmit(q);
                            }}
                            className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-[11px] font-medium text-stone-800"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                      Popular Looks
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_SEARCHES.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => {
                            setLocalSearch(q);
                            handleSearchSubmit(q);
                          }}
                          className="px-2.5 py-1 rounded-full border border-stone-200 hover:border-stone-900 text-[11px] font-medium text-stone-700"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Search Link */}
            <Link
              href="/discover"
              aria-label="Search Marketplace"
              className="md:hidden p-2 rounded-full text-stone-700 hover:bg-stone-100"
            >
              <Search className="w-4 h-4" />
            </Link>

            {/* Notifications */}
            <div ref={notifWrapperRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((o) => !o);
                  setAccountOpen(false);
                }}
                aria-label="Notifications"
                className="relative p-2 rounded-full text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="text-xs font-bold text-stone-900">Notifications</span>
                    <Link
                      href="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="text-[11px] font-semibold text-stone-600 hover:text-stone-950 underline"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.slice(0, 3).map((n) => (
                      <Link
                        key={n.id}
                        href={n.href || '/notifications'}
                        onClick={() => {
                          markNotificationRead(n.id);
                          setNotifOpen(false);
                        }}
                        className={`block p-2.5 rounded-xl border transition-colors ${
                          n.read ? 'bg-white border-stone-100' : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <p className="text-xs font-bold text-stone-900">{n.title}</p>
                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">{n.message}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Favorites */}
            <Link
              href="/account/wishlist"
              aria-label="Saved Favorites"
              className="relative p-2 rounded-full text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              type="button"
              onClick={handleOpenCart}
              aria-label="Shopping Bag"
              className="relative p-2 rounded-full text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalBagCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-stone-950 text-white text-[10px] font-bold flex items-center justify-center">
                  {totalBagCount}
                </span>
              )}
            </button>

            {/* Account */}
            {session?.user ? (
              <div ref={accountWrapperRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen((o) => !o);
                    setNotifOpen(false);
                  }}
                  aria-expanded={accountOpen}
                  aria-label="Open profile menu"
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 text-xs font-semibold text-stone-900 transition-colors"
                >
                  <div className="relative w-6 h-6 rounded-full bg-stone-950 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={userDisplayName}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <span>{userInitial}</span>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <span className="max-w-[110px] sm:max-w-[140px] truncate font-semibold text-stone-900">
                    {userDisplayName}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-stone-500 shrink-0 transition-transform ${
                      accountOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-stone-200 rounded-2xl shadow-2xl p-2.5 z-50 text-xs">
                    {/* User Identity Header */}
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-100 mb-2">
                      <div className="relative w-10 h-10 rounded-full bg-stone-950 text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {session.user.image ? (
                          <Image
                            src={session.user.image}
                            alt={userDisplayName}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span>{userInitial}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-stone-950 truncate">{userDisplayName}</p>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-label="Verified" />
                        </div>
                        <p className="text-[11px] text-stone-500 truncate">{session.user.email}</p>
                      </div>
                    </div>

                    {/* Quick Profile Summary Stats */}
                    <div className="grid grid-cols-3 gap-1.5 mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountOpen(false);
                          handleOpenCart();
                        }}
                        className="p-2 rounded-xl border border-stone-100 hover:border-stone-300 bg-white text-center transition-colors"
                      >
                        <p className="font-bold text-stone-950 text-sm">{totalBagCount}</p>
                        <p className="text-[10px] text-stone-500 font-medium">Cart</p>
                      </button>
                      <Link
                        href="/account/orders"
                        onClick={() => setAccountOpen(false)}
                        className="p-2 rounded-xl border border-stone-100 hover:border-stone-300 bg-white text-center transition-colors"
                      >
                        <p className="font-bold text-stone-950 text-sm">{ordersCount}</p>
                        <p className="text-[10px] text-stone-500 font-medium">Orders</p>
                      </Link>
                      <Link
                        href="/account/wishlist"
                        onClick={() => setAccountOpen(false)}
                        className="p-2 rounded-xl border border-stone-100 hover:border-stone-300 bg-white text-center transition-colors"
                      >
                        <p className="font-bold text-stone-950 text-sm">{wishlistCount}</p>
                        <p className="text-[10px] text-stone-500 font-medium">Saved</p>
                      </Link>
                    </div>

                    {/* User Profile Navigation */}
                    <div className="space-y-0.5">
                      <Link
                        href="/account/profile"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-stone-100 font-medium text-stone-800"
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <User className="w-3.5 h-3.5 text-stone-600" />
                          <span>My Profile &amp; Addresses</span>
                        </span>
                      </Link>
                      <Link
                        href="/account"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-stone-100 font-medium text-stone-800"
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <LayoutDashboard className="w-3.5 h-3.5 text-stone-600" />
                          <span>Account Overview</span>
                        </span>
                      </Link>
                      <Link
                        href="/try-on"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-stone-100 font-medium text-stone-800"
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Virtual Try-On Test Studio</span>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-bold">
                          Test
                        </span>
                      </Link>
                      <Link
                        href="/account/try-on-history"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-stone-100 font-medium text-stone-800"
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <History className="w-3.5 h-3.5 text-stone-600" />
                          <span>Try-On History</span>
                        </span>
                        {tryOnCount > 0 && (
                          <span className="text-[10px] font-bold text-stone-500">{tryOnCount}</span>
                        )}
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-stone-100 font-medium text-stone-800"
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <Package className="w-3.5 h-3.5 text-stone-600" />
                          <span>My Orders</span>
                        </span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountOpen(false);
                          handleOpenCart();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-stone-100 font-medium text-stone-800 text-left"
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-stone-600" />
                          <span>Shopping Cart</span>
                        </span>
                        {totalBagCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-stone-950 text-white text-[10px] font-bold">
                            {totalBagCount}
                          </span>
                        )}
                      </button>
                      <Link
                        href="/account/wishlist"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-stone-100 font-medium text-stone-800"
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <Heart className="w-3.5 h-3.5 text-stone-600" />
                          <span>Saved Favorites</span>
                        </span>
                        {wishlistCount > 0 && (
                          <span className="text-[10px] font-bold text-stone-500">{wishlistCount}</span>
                        )}
                      </Link>
                      <Link
                        href="/notifications"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-stone-100 font-medium text-stone-800"
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <Bell className="w-3.5 h-3.5 text-stone-600" />
                          <span>Notifications</span>
                        </span>
                        {unreadNotifs > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                            {unreadNotifs}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/account/settings"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-stone-100 font-medium text-stone-800"
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <Settings className="w-3.5 h-3.5 text-stone-600" />
                          <span>Settings &amp; Privacy</span>
                        </span>
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        const { logoutMarketplace } = await import('@/lib/logout');
                        await logoutMarketplace({ callbackUrl: '/' });
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 font-semibold text-rose-600 flex items-center gap-2.5 mt-2 border-t border-stone-100 pt-2.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="inline-flex items-center justify-center gap-1.5 h-8 sm:h-9 px-3 sm:px-3.5 rounded-full border border-stone-200 bg-white hover:bg-stone-100 text-[11px] sm:text-xs font-semibold text-stone-800 whitespace-nowrap shrink-0 transition-colors"
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span>Log In</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="inline-flex items-center justify-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 rounded-full bg-stone-950 hover:bg-stone-800 text-white text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 shadow-sm transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 shrink-0 hidden sm:inline" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/40 backdrop-blur-sm">
          <div className="w-80 max-w-[85vw] h-full bg-white p-6 flex flex-col justify-between overflow-y-auto shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <span className="font-serif font-bold text-lg tracking-wider text-stone-950">V-TRY</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchSubmit();
                }}
                className="relative"
              >
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Search marketplace..."
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </form>

              <nav className="space-y-1">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-800 hover:bg-stone-100"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/try-on"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold bg-stone-950 text-white mt-2"
                >
                  <Sparkles className="w-4 h-4" /> Virtual Try-On Studio
                </Link>
              </nav>
            </div>

            <div className="border-t border-stone-100 pt-4 space-y-2 text-xs">
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-stone-50 font-semibold"
              >
                <span>Shopping Cart</span>
                <span>{totalBagCount} items</span>
              </Link>
              {session?.user ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-100">
                    <div className="w-8 h-8 rounded-full bg-stone-950 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {userInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-stone-950 truncate">{userDisplayName}</p>
                      <p className="text-[11px] text-stone-500 truncate">{session.user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <Link
                      href="/account/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-50 font-semibold"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/account/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-50 font-semibold"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Settings</span>
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const { logoutMarketplace } = await import('@/lib/logout');
                      await logoutMarketplace({ callbackUrl: '/' });
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-600 font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 font-semibold text-stone-900"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Log In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal('signup')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 font-semibold text-white"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-stone-200 px-2 py-1.5 grid grid-cols-5 text-[10px] font-semibold text-stone-500"
      >
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 py-1 ${pathname === '/' ? 'text-stone-950 font-bold' : ''}`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <Link
          href="/discover"
          className={`flex flex-col items-center gap-0.5 py-1 ${pathname.startsWith('/discover') ? 'text-stone-950 font-bold' : ''}`}
        >
          <Compass className="w-4 h-4" />
          <span>Discover</span>
        </Link>
        <Link
          href="/try-on"
          className={`flex flex-col items-center gap-0.5 py-1 ${pathname.startsWith('/try-on') ? 'text-stone-950 font-bold' : 'text-stone-900'}`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Try-On</span>
        </Link>
        <Link
          href="/brands"
          className={`flex flex-col items-center gap-0.5 py-1 ${pathname.startsWith('/brands') ? 'text-stone-950 font-bold' : ''}`}
        >
          <Store className="w-4 h-4" />
          <span>Brands</span>
        </Link>
        <Link
          href={session?.user ? '/account' : '/login'}
          className={`flex flex-col items-center gap-0.5 py-1 ${pathname.startsWith('/account') ? 'text-stone-950 font-bold' : ''}`}
        >
          <User className="w-4 h-4" />
          <span>Account</span>
        </Link>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}

export const MarketplaceHeader = Navbar;
