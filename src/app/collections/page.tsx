'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePublishedProductsQuery } from '../../hooks/useCatalogData';
import { filterAndSortProducts, getCollectionsWithCounts } from '../../services';
import { MarketplaceShell } from '../../components/layout/MarketplaceShell';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { ProductGrid } from '../../components/modules/ProductGrid';
import { ProductGridSkeleton, SafeImage } from '../../components/ui/States';

function CollectionsContent() {
  const searchParams = useSearchParams();
  const initialSlug = searchParams.get('collection') || 'all';
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);
  const { data, isLoading } = usePublishedProductsQuery();

  const collections = useMemo(
    () => getCollectionsWithCounts(data.products),
    [data.products]
  );

  const activeCollection = collections.find((c) => c.slug === selectedSlug) || null;

  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(data.products, {
      collection: selectedSlug === 'all' ? undefined : activeCollection?.name || selectedSlug,
      sortBy: 'recommended',
    }).items;
  }, [data.products, selectedSlug, activeCollection]);

  return (
    <MarketplaceShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
        <Breadcrumb items={[{ label: 'Collections' }]} />

        <div className="space-y-2 max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">
            Curated Wardrobes
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950">
            {activeCollection ? activeCollection.name : 'Seasonal & Editorial Collections'}
          </h1>
          <p className="text-sm text-stone-600">
            {activeCollection
              ? activeCollection.description
              : 'Dynamic collections uniting published garments across participating brands.'}
          </p>
        </div>

        {/* Visual Collection Strip */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <button
            type="button"
            onClick={() => setSelectedSlug('all')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold border whitespace-nowrap ${
              selectedSlug === 'all'
                ? 'bg-stone-950 text-white border-stone-950'
                : 'bg-white text-stone-700 border-stone-200 hover:border-stone-900'
            }`}
          >
            All Collections
          </button>
          {collections.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedSlug(c.slug)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border whitespace-nowrap ${
                selectedSlug === c.slug
                  ? 'bg-stone-950 text-white border-stone-950'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-900'
              }`}
            >
              <span>{c.name}</span>
              <span className="opacity-70">({c.productCount})</span>
            </button>
          ))}
        </div>

        {/* Collection Feature Cards when "all" selected */}
        {selectedSlug === 'all' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {collections.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => setSelectedSlug(col.slug)}
                className="group relative aspect-[16/10] rounded-3xl overflow-hidden border border-stone-200 text-left bg-stone-900"
              >
                <SafeImage
                  src={col.image}
                  alt={col.name}
                  fill
                  className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                    {col.season} • {col.productCount} Items
                  </span>
                  <h2 className="font-serif text-xl font-bold">{col.name}</h2>
                  <p className="text-xs text-white/80 line-clamp-1">{col.tagline}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-stone-950">
              {activeCollection ? `${activeCollection.name} Pieces` : 'All Collection Pieces'} ({filteredProducts.length})
            </h2>
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <ProductGrid
              products={filteredProducts}
              columns={4}
              onResetEmpty={() => setSelectedSlug('all')}
            />
          )}
        </div>
      </div>
    </MarketplaceShell>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto"><ProductGridSkeleton /></div>}>
      <CollectionsContent />
    </Suspense>
  );
}

