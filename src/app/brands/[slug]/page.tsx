'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Check,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Users,
} from 'lucide-react';
import { useBrandStorefrontQuery } from '../../../hooks/useCatalogData';
import { useMarketplaceStore } from '../../../stores/useMarketplaceStore';
import { MarketplaceShell } from '../../../components/layout/MarketplaceShell';
import { Breadcrumb } from '../../../components/layout/Breadcrumb';
import { ProductGrid } from '../../../components/modules/ProductGrid';
import { TryOnStudio } from '../../../components/try-on/TryOnStudio';
import { EmptyState, ProductGridSkeleton, SafeImage } from '../../../components/ui/States';
import { Button } from '../../../components/ui/button';

type StorefrontTab =
  | 'overview'
  | 'all'
  | 'collections'
  | 'new'
  | 'bestsellers'
  | 'try-on'
  | 'about';

function BrandStorefrontContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = String(params.slug || '');

  const initialTab = (searchParams.get('tab') as StorefrontTab) || 'overview';
  const initialProductId = searchParams.get('productId') || undefined;

  const { data, isLoading } = useBrandStorefrontQuery(slug);
  const followedBrandSlugs = useMarketplaceStore((s) => s.followedBrandSlugs);
  const toggleFollowBrand = useMarketplaceStore((s) => s.toggleFollowBrand);

  const [activeTab, setActiveTab] = useState<StorefrontTab>(initialTab);
  const [brandSearch, setBrandSearch] = useState('');
  const [brandCategory, setBrandCategory] = useState('All');
  const [copied, setCopied] = useState(false);

  const brand = data?.brand || null;

  // Strictly scoped ONLY to this brand's customer-visible catalog
  const brandProducts = useMemo(() => {
    if (!brand || !data?.products) return [];
    return data.products.filter(
      (p) =>
        p.brandSlug === brand.slug &&
        p.brandStorefrontPublished === true &&
        p.marketplaceStatus !== 'DRAFT' &&
        p.marketplaceStatus !== 'ARCHIVED'
    );
  }, [brand, data?.products]);

  const brandTryOnProducts = useMemo(
    () => brandProducts.filter((p) => p.isTryOnEligible && p.brandSlug === brand?.slug),
    [brandProducts, brand?.slug]
  );

  const categoriesInBrand = useMemo(
    () => ['All', ...Array.from(new Set(brandProducts.map((p) => p.category)))],
    [brandProducts]
  );

  const filteredBrandProducts = useMemo(() => {
    let list = [...brandProducts];
    if (activeTab === 'new') list = list.filter((p) => p.isNewArrival);
    if (activeTab === 'bestsellers') list = [...list].sort((a, b) => b.totalSold - a.totalSold);
    if (brandCategory !== 'All') list = list.filter((p) => p.category === brandCategory);
    if (brandSearch.trim()) {
      const q = brandSearch.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [brandProducts, activeTab, brandCategory, brandSearch]);

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  if (isLoading && !brand) {
    return (
      <MarketplaceShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
          <ProductGridSkeleton count={6} />
        </div>
      </MarketplaceShell>
    );
  }

  if (!brand) {
    return (
      <MarketplaceShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 w-full">
          <EmptyState
            title="Brand Storefront Not Found"
            description="This brand storefront may be inactive or does not exist."
            actionLabel="Browse Active Brands"
            actionHref="/brands"
          />
        </div>
      </MarketplaceShell>
    );
  }

  const isFollowing = followedBrandSlugs.includes(brand.slug);
  const followersCount = brand.totalFollowers + (isFollowing ? 1 : 0);

  return (
    <MarketplaceShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        <Breadcrumb
          items={[
            { label: 'Brands', href: '/brands' },
            { label: brand.name },
          ]}
        />

        {/* Brand Storefront Banner Header */}
        <section className="rounded-3xl overflow-hidden border border-stone-200 bg-white shadow-sm">
          {brand.announcement && (
            <div
              className="px-4 py-2 text-center text-xs font-bold text-white"
              style={{ backgroundColor: brand.accentColor || '#1C1917' }}
            >
              {brand.announcement}
            </div>
          )}

          <div className="relative h-52 sm:h-64 bg-stone-900">
            <SafeImage
              src={brand.coverImage}
              alt={brand.name}
              fill
              priority
              className="object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>

          <div className="px-6 sm:px-8 pb-6 sm:pb-8 -mt-12 relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-xl shrink-0">
                <SafeImage src={brand.logo} alt={brand.name} fill className="object-cover" />
              </div>

              <div className="space-y-1.5 pt-2 sm:pt-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950 sm:text-white lg:text-stone-950 sm:drop-shadow-none">
                    <span className="sm:bg-white sm:px-2 sm:py-0.5 sm:rounded-lg">{brand.name}</span>
                  </h1>
                  {brand.verificationStatus === 'VERIFIED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Brand
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">{brand.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 pt-1">
                  <span className="inline-flex items-center gap-1 font-bold text-stone-900">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {brand.rating.toFixed(1)} ({brand.totalReviews} reviews)
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-stone-900">{brandProducts.length} Customer-Visible Items</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {followersCount.toLocaleString()} followers
                  </span>
                  <span>•</span>
                  <span>{brand.originCity}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                type="button"
                variant={isFollowing ? 'outline' : 'default'}
                onClick={() => toggleFollowBrand(brand.slug)}
                className="rounded-full text-xs font-bold"
              >
                {isFollowing ? '✓ Following Brand' : '+ Follow Brand'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab('try-on')}
                className="rounded-full text-xs font-bold gap-1.5 border-stone-900 text-stone-950"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Brand Try-On ({brandTryOnProducts.length})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleShare}
                aria-label="Share brand storefront"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Storefront Navigation Tabs */}
          <div className="border-t border-stone-200 px-4 sm:px-8 flex overflow-x-auto no-scrollbar gap-6 text-xs font-bold">
            {(
              [
                ['overview', 'Overview'],
                ['all', `All Products (${brandProducts.length})`],
                ['collections', 'Collections'],
                ['new', 'New Arrivals'],
                ['bestsellers', 'Best Sellers'],
                ['try-on', 'Virtual Try-On'],
                ['about', 'About Brand'],
              ] as Array<[StorefrontTab, string]>
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`py-4 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === key
                    ? 'border-stone-950 text-stone-950'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Tab Body */}
        {activeTab === 'try-on' ? (
          <section className="space-y-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-950">
                {brand.name} Exclusive Try-On Studio
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Strictly isolated to garments owned by {brand.name} (including storefront-only exclusives). No other brand items appear here.
              </p>
            </div>

            <TryOnStudio
              eligibleProducts={brandTryOnProducts}
              initialProductId={initialProductId}
              scopedBrandName={brand.name}
              scopedBrandSlug={brand.slug}
            />
          </section>
        ) : activeTab === 'about' ? (
          <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="space-y-3">
              <h2 className="font-serif text-2xl font-bold text-stone-950">About {brand.name}</h2>
              <p className="text-stone-600 leading-relaxed">{brand.description}</p>
              <p className="text-xs text-stone-500">Studio Origin: {brand.originCity}</p>
              {brand.socialLinks?.instagram && (
                <p className="text-xs font-semibold text-stone-800">
                  Social: {brand.socialLinks.instagram}
                </p>
              )}
            </div>
            <div className="space-y-3 rounded-2xl bg-stone-50 border border-stone-200 p-5 text-xs">
              <p className="font-bold text-stone-950 flex items-center gap-2">
                <Truck className="w-4 h-4" /> Brand Fulfillment &amp; Returns
              </p>
              <p className="text-stone-600">Delivery Window: {brand.deliveryEstimate || '2–4 business days'}</p>
              <p className="text-stone-600">Return Policy: {brand.returnPolicy || '30-day complimentary returns'}</p>
            </div>
          </section>
        ) : activeTab === 'collections' ? (
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-stone-950">
              {brand.name} Collections
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(brand.collections || ['Signature Capsule']).map((colName) => (
                <div key={colName} className="rounded-2xl border border-stone-200 bg-white p-5 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Curated Capsule
                  </p>
                  <h3 className="font-serif text-lg font-bold text-stone-950">{colName}</h3>
                  <p className="text-xs text-stone-500">
                    {brandProducts.filter((p) => (p.collections || []).includes(colName)).length} pieces available
                  </p>
                </div>
              ))}
            </div>
            <ProductGrid
              products={filteredBrandProducts}
              brandStorefrontContextSlug={brand.slug}
              columns={4}
            />
          </section>
        ) : (
          <section className="space-y-6">
            {/* Search & Category Filter scoped cleanly within this brand */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-stone-200 rounded-2xl p-4">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {categoriesInBrand.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setBrandCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap ${
                      brandCategory === cat
                        ? 'bg-stone-950 text-white border-stone-950'
                        : 'bg-white text-stone-600 border-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder={`Search inside ${brand.name}...`}
                  className="w-full pl-9 pr-3 py-2 rounded-full bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-950"
                />
              </div>
            </div>

            <ProductGrid
              products={filteredBrandProducts}
              brandStorefrontContextSlug={brand.slug}
              columns={4}
              emptyTitle={`No matching items inside ${brand.name}`}
              emptyDescription="Try clearing the search query or selecting All categories."
              onResetEmpty={() => {
                setBrandSearch('');
                setBrandCategory('All');
              }}
            />
          </section>
        )}
      </div>
    </MarketplaceShell>
  );
}

export default function BrandStorefrontPage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto"><ProductGridSkeleton /></div>}>
      <BrandStorefrontContent />
    </Suspense>
  );
}

