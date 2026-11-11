'use client';

import React, { useMemo, useState } from 'react';
import { Search, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { useBrandsDirectoryQuery } from '../../hooks/useCatalogData';
import { MarketplaceShell } from '../../components/layout/MarketplaceShell';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { BrandCard } from '../../components/brand/BrandCard';
import { EmptyState } from '../../components/ui/States';

type BrandTab = 'all' | 'featured' | 'verified' | 'popular' | 'recent';

export default function BrandsDirectoryPage() {
  const { data: brands } = useBrandsDirectoryQuery();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<BrandTab>('all');
  const [focus, setFocus] = useState('All');

  const focusOptions = useMemo(
    () => [
      'All',
      'Womenswear',
      'Menswear',
      'Traditional',
      'Streetwear',
      'Sarees',
      'Accessories',
    ],
    []
  );

  const filteredBrands = useMemo(() => {
    let list = [...brands];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.tagline.toLowerCase().includes(q) ||
          b.originCity.toLowerCase().includes(q) ||
          b.categoryFocus.toLowerCase().includes(q)
      );
    }

    if (focus !== 'All') {
      const f = focus.toLowerCase();
      list = list.filter((b) => b.categoryFocus.toLowerCase().includes(f) || b.description.toLowerCase().includes(f));
    }

    if (tab === 'featured') list = list.filter((b) => b.isFeatured);
    if (tab === 'verified') list = list.filter((b) => b.verificationStatus === 'VERIFIED');
    if (tab === 'recent') list = list.filter((b) => b.isRecentlyJoined);
    if (tab === 'popular') list.sort((a, b) => b.totalFollowers - a.totalFollowers);

    return list;
  }, [brands, search, tab, focus]);

  return (
    <MarketplaceShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
        <Breadcrumb items={[{ label: 'Brands' }]} />

        {/* Directory Header */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-9 space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Independent Partner Storefronts
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950">
                Explore Participating Brands
              </h1>
              <p className="text-sm text-stone-600">
                Every brand hosts its own dedicated storefront featuring its full customer-facing catalog, signature collections, and isolated virtual try-on room.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search brands by name or city..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:outline-none focus:border-stone-950"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['all', 'All Brands'],
                  ['featured', 'Featured'],
                  ['verified', 'Verified'],
                  ['popular', 'Most Popular'],
                  ['recent', 'Recently Joined'],
                ] as Array<[BrandTab, string]>
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    tab === key
                      ? 'bg-stone-950 text-white border-stone-950'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-stone-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-medium">Focus:</span>
              <select
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="px-3 py-1.5 rounded-full border border-stone-200 bg-stone-50 font-semibold text-stone-900"
              >
                {focusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Highlights Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-stone-200 bg-white p-4 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
            <div>
              <p className="font-bold text-stone-900">Verified Independent Sellers</p>
              <p className="text-stone-500">Orders fulfill directly by each brand boutique</p>
            </div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-stone-900">Brand-Isolated Virtual Try-On</p>
              <p className="text-stone-500">Test each brand&apos;s storefront exclusives inside its room</p>
            </div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4 flex items-center gap-3">
            <Star className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <p className="font-bold text-stone-900">4.8★ Average Brand Rating</p>
              <p className="text-stone-500">Rated across thousands of verified fit reviews</p>
            </div>
          </div>
        </div>

        {filteredBrands.length === 0 ? (
          <EmptyState
            title="No brands matched your query"
            description="Try clearing the search query or switching to All Brands."
            actionLabel="Show All Brands"
            onAction={() => {
              setSearch('');
              setTab('all');
              setFocus('All');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map((brand) => (
              <BrandCard key={brand.slug} brand={brand} />
            ))}
          </div>
        )}
      </div>
    </MarketplaceShell>
  );
}

