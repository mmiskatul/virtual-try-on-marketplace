'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowUpDown,
  Check,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { MARKETPLACE_CATEGORIES, SEED_BRANDS } from '../../data/catalogSeed';
import { usePublishedProductsQuery } from '../../hooks/useCatalogData';
import { useMarketplaceStore } from '../../stores/useMarketplaceStore';
import { DiscoveryFilterParams, filterAndSortProducts } from '../../services';
import { MarketplaceShell } from '../../components/layout/MarketplaceShell';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { ProductGrid } from '../../components/modules/ProductGrid';
import { ProductGridSkeleton } from '../../components/ui/States';
import { Button } from '../../components/ui/button';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLOR_FILTERS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#F9FAFB' },
  { name: 'Ivory', hex: '#F3EFEA' },
  { name: 'Indigo', hex: '#1E3A8A' },
  { name: 'Rose', hex: '#E8B4BC' },
  { name: 'Olive', hex: '#57534E' },
  { name: 'Camel', hex: '#B48A5A' },
];
const SORT_OPTIONS: Array<{ value: NonNullable<DiscoveryFilterParams['sortBy']>; label: string }> = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'reviews', label: 'Most Reviewed' },
];

function DiscoverContent() {
  const searchParams = useSearchParams();
  const { data: catalogData, isLoading } = usePublishedProductsQuery();
  const recentSearches = useMarketplaceStore((s) => s.recentSearches);
  const addRecentSearch = useMarketplaceStore((s) => s.addRecentSearch);
  const clearRecentSearches = useMarketplaceStore((s) => s.clearRecentSearches);

  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brand') ? [searchParams.get('brand')!] : []
  );
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(600);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(searchParams.get('onSale') === 'true');
  const [tryOnOnly, setTryOnOnly] = useState<boolean>(searchParams.get('tryOnOnly') === 'true');
  const [productType, setProductType] = useState<NonNullable<DiscoveryFilterParams['productType']>>(
    (searchParams.get('productType') as any) || 'all'
  );
  const [sortBy, setSortBy] = useState<NonNullable<DiscoveryFilterParams['sortBy']>>(
    (searchParams.get('sortBy') as any) || 'recommended'
  );
  const [collection, setCollection] = useState<string>(searchParams.get('collection') || 'all');
  const [page, setPage] = useState<number>(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);

  useEffect(() => {
    const paramQ = searchParams.get('q');
    const paramCat = searchParams.get('category');
    const paramType = searchParams.get('productType');
    const paramTryOn = searchParams.get('tryOnOnly');
    const paramSale = searchParams.get('onSale');
    if (paramQ !== null) setQ(paramQ);
    if (paramCat) setCategory(paramCat);
    if (paramType) setProductType(paramType as any);
    if (paramTryOn === 'true') setTryOnOnly(true);
    if (paramSale === 'true') setOnSaleOnly(true);
  }, [searchParams]);

  const publishedPool = catalogData.products;

  const filtered = useMemo(() => {
    return filterAndSortProducts(publishedPool, {
      q,
      category,
      brands: selectedBrands,
      minPrice,
      maxPrice,
      minRating,
      sizes: selectedSizes,
      colors: selectedColors,
      inStockOnly,
      onSaleOnly,
      tryOnOnly,
      collection,
      productType,
      sortBy,
      page,
      limit: 12,
    });
  }, [
    publishedPool,
    q,
    category,
    selectedBrands,
    minPrice,
    maxPrice,
    minRating,
    selectedSizes,
    selectedColors,
    inStockOnly,
    onSaleOnly,
    tryOnOnly,
    collection,
    productType,
    sortBy,
    page,
  ]);

  const resetAllFilters = () => {
    setQ('');
    setCategory('All');
    setSelectedBrands([]);
    setMinPrice(0);
    setMaxPrice(600);
    setMinRating(0);
    setSelectedSizes([]);
    setSelectedColors([]);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setTryOnOnly(false);
    setProductType('all');
    setCollection('all');
    setSortBy('recommended');
    setPage(1);
  };

  const toggleBrand = (slug: string) => {
    setPage(1);
    setSelectedBrands((prev) =>
      prev.includes(slug) ? prev.filter((b) => b !== slug) : [...prev, slug]
    );
  };

  const toggleSize = (s: string) => {
    setPage(1);
    setSelectedSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const toggleColor = (c: string) => {
    setPage(1);
    setSelectedColors((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const renderFilterPanels = () => (
    <div className="space-y-6 text-xs">
      {/* Category */}
      <div className="space-y-2.5">
        <h3 className="font-bold uppercase tracking-wider text-[11px] text-stone-900">Category</h3>
        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
          {['All', ...MARKETPLACE_CATEGORIES.map((c) => c.name)].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                category === cat
                  ? 'bg-stone-950 text-white font-bold'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span>{cat}</span>
              {category === cat && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Try-On & Quick Toggles */}
      <div className="space-y-2.5 pt-4 border-t border-stone-200">
        <h3 className="font-bold uppercase tracking-wider text-[11px] text-stone-900">Features</h3>
        <label className="flex items-center gap-2 cursor-pointer text-stone-700 font-medium">
          <input
            type="checkbox"
            checked={tryOnOnly}
            onChange={(e) => {
              setTryOnOnly(e.target.checked);
              setPage(1);
            }}
            className="rounded accent-stone-950"
          />
          <span className="inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Virtual Try-On Eligible
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-stone-700 font-medium">
          <input
            type="checkbox"
            checked={onSaleOnly}
            onChange={(e) => {
              setOnSaleOnly(e.target.checked);
              setPage(1);
            }}
            className="rounded accent-stone-950"
          />
          <span>On Sale / Discounted</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-stone-700 font-medium">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => {
              setInStockOnly(e.target.checked);
              setPage(1);
            }}
            className="rounded accent-stone-950"
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {/* Product Type */}
      <div className="space-y-2.5 pt-4 border-t border-stone-200">
        <h3 className="font-bold uppercase tracking-wider text-[11px] text-stone-900">Edit Type</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { value: 'all', label: 'All' },
            { value: 'new', label: 'New Arrivals' },
            { value: 'trending', label: 'Trending' },
            { value: 'bestseller', label: 'Best Sellers' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setProductType(opt.value as any);
                setPage(1);
              }}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold ${
                productType === opt.value
                  ? 'bg-stone-950 text-white border-stone-950'
                  : 'bg-white text-stone-600 border-stone-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3 pt-4 border-t border-stone-200">
        <div className="flex items-center justify-between">
          <h3 className="font-bold uppercase tracking-wider text-[11px] text-stone-900">Price Range</h3>
          <span className="font-mono font-bold text-stone-800">${minPrice} – ${maxPrice}</span>
        </div>
        <input
          type="range"
          min={40}
          max={600}
          step={10}
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(Number(e.target.value));
            setPage(1);
          }}
          aria-label="Maximum price slider"
          className="w-full accent-stone-950"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => {
              setMinPrice(Number(e.target.value) || 0);
              setPage(1);
            }}
            placeholder="Min"
            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
          />
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(Number(e.target.value) || 600);
              setPage(1);
            }}
            placeholder="Max"
            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
          />
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-2.5 pt-4 border-t border-stone-200">
        <h3 className="font-bold uppercase tracking-wider text-[11px] text-stone-900">Brands</h3>
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {SEED_BRANDS.map((b) => (
            <label key={b.slug} className="flex items-center gap-2 cursor-pointer text-stone-700">
              <input
                type="checkbox"
                checked={selectedBrands.includes(b.slug)}
                onChange={() => toggleBrand(b.slug)}
                className="rounded accent-stone-950"
              />
              <span className="truncate">{b.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-2 pt-4 border-t border-stone-200">
        <h3 className="font-bold uppercase tracking-wider text-[11px] text-stone-900">Rating</h3>
        <div className="flex flex-col gap-1">
          {[
            { value: 0, label: 'All Ratings' },
            { value: 4, label: '4★ and above' },
            { value: 3, label: '3★ and above' },
          ].map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => {
                setMinRating(r.value);
                setPage(1);
              }}
              className={`text-left px-2.5 py-1.5 rounded-lg ${
                minRating === r.value
                  ? 'bg-stone-950 text-white font-bold'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2 pt-4 border-t border-stone-200">
        <h3 className="font-bold uppercase tracking-wider text-[11px] text-stone-900">Size</h3>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSize(s)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                selectedSizes.includes(s)
                  ? 'bg-stone-950 text-white border-stone-950'
                  : 'bg-white text-stone-700 border-stone-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-2 pt-4 border-t border-stone-200">
        <h3 className="font-bold uppercase tracking-wider text-[11px] text-stone-900">Color Swatch</h3>
        <div className="flex flex-wrap gap-2">
          {COLOR_FILTERS.map((c) => {
            const active = selectedColors.includes(c.name);
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => toggleColor(c.name)}
                title={c.name}
                className={`w-6 h-6 rounded-full border transition-transform ${
                  active ? 'ring-2 ring-stone-950 ring-offset-2 scale-110 border-stone-950' : 'border-stone-300'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      </div>

      <Button variant="outline" onClick={resetAllFilters} className="w-full text-xs">
        Reset All Filters
      </Button>
    </div>
  );

  return (
    <MarketplaceShell
      search={q}
      onSearchChange={(val) => {
        setQ(val);
        setPage(1);
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        <Breadcrumb items={[{ label: 'Discover Marketplace' }]} />

        {/* Header + Search Toolbar */}
        <div className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-7 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950">
                Discover Marketplace
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Showing {filtered.total} published styles across participating brands. Draft &amp; brand-private items remain excluded.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (q.trim()) addRecentSearch(q.trim());
                setPage(1);
              }}
              className="relative w-full md:w-96"
            >
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Search products, brands, fabrics, tags..."
                className="w-full pl-10 pr-9 py-2.5 rounded-full bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:outline-none focus:border-stone-950"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => {
                    setQ('');
                    setPage(1);
                  }}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          {/* Search Suggestions & Recent History */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1 border-t border-stone-100">
            <span className="font-bold uppercase tracking-wider text-stone-400">Suggestions:</span>
            {['Silk', 'Panjabi', 'Blazer', 'Jamdani', 'Hoodie', 'Jeans'].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setQ(term);
                  addRecentSearch(term);
                  setPage(1);
                }}
                className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
              >
                {term}
              </button>
            ))}
            {recentSearches.length > 0 && (
              <>
                <span className="text-stone-300">|</span>
                <span className="text-stone-400 font-semibold">Recent:</span>
                {recentSearches.slice(0, 3).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setQ(r);
                      setPage(1);
                    }}
                    className="px-2.5 py-1 rounded-full border border-stone-200 hover:border-stone-900 text-stone-700"
                  >
                    {r}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-stone-400 hover:text-rose-600 underline ml-1"
                >
                  Clear history
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 rounded-3xl border border-stone-200 bg-white p-5 sticky top-20">
            {renderFilterPanels()}
          </aside>

          {/* Main Area */}
          <div className="lg:col-span-9 space-y-5">
            {/* Sort & Mobile Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-stone-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 text-xs font-bold text-stone-800"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
                </button>

                <button
                  type="button"
                  onClick={() => setMobileSortOpen(true)}
                  className="sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 text-xs font-bold text-stone-800"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" /> Sort
                </button>

                <span className="text-xs font-semibold text-stone-600 hidden sm:inline">
                  {filtered.total} product{filtered.total === 1 ? '' : 's'} found
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="text-stone-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    setPage(1);
                  }}
                  aria-label="Sort products"
                  className="px-3 py-1.5 rounded-full border border-stone-200 bg-stone-50 font-semibold text-stone-900 focus:outline-none focus:border-stone-950"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading && publishedPool.length === 0 ? (
              <ProductGridSkeleton count={8} />
            ) : (
              <ProductGrid
                products={filtered.items}
                columns={3}
                emptyTitle={q ? `No matches for "${q}"` : 'No matching styles found'}
                emptyDescription="Try clearing search terms, relaxing price range, or exploring all brands."
                onResetEmpty={resetAllFilters}
              />
            )}

            {/* Pagination */}
            {filtered.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs font-semibold text-stone-600 px-3">
                  Page {filtered.page} of {filtered.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= filtered.totalPages}
                  onClick={() => setPage((p) => Math.min(filtered.totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/50 backdrop-blur-sm flex">
          <div className="w-80 max-w-[85vw] h-full bg-white p-5 overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="font-serif font-bold text-base">Filters</span>
              <button type="button" onClick={() => setMobileFiltersOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderFilterPanels()}
          </div>
          <div className="flex-1" onClick={() => setMobileFiltersOpen(false)} />
        </div>
      )}

      {/* Mobile Sort Bottom Sheet */}
      {mobileSortOpen && (
        <div className="fixed inset-0 z-50 sm:hidden bg-black/45 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="font-serif font-bold text-base">Sort Products</span>
              <button type="button" onClick={() => setMobileSortOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSortBy(opt.value);
                    setPage(1);
                    setMobileSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between ${
                    sortBy === opt.value ? 'bg-stone-950 text-white' : 'text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </MarketplaceShell>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto"><ProductGridSkeleton /></div>}>
      <DiscoverContent />
    </Suspense>
  );
}

