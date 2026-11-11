'use client';

import React, { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { usePublishedProductsQuery } from '../../hooks/useCatalogData';
import { MarketplaceShell } from '../../components/layout/MarketplaceShell';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { TryOnStudio } from '../../components/try-on/TryOnStudio';
import { ProductGridSkeleton } from '../../components/ui/States';

function GlobalTryOnStudioContent() {
  const searchParams = useSearchParams();
  const initialProductId = searchParams.get('productId') || undefined;
  const { data } = usePublishedProductsQuery();

  // STRICT GLOBAL TRY-ON VISIBILITY GUARD:
  // Global Marketplace Try-On accepts ONLY PUBLISHED & Try-On Eligible marketplace products.
  const eligiblePublishedProducts = useMemo(
    () =>
      data.products.filter(
        (p) =>
          p.marketplaceStatus === 'PUBLISHED' &&
          p.marketplacePublished === true &&
          p.isTryOnEligible === true
      ),
    [data.products]
  );

  return (
    <MarketplaceShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        <Breadcrumb items={[{ label: 'Virtual Try-On Studio' }]} />

        <div className="space-y-2 max-w-2xl">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Interactive AI Fitting Room
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950">
            Virtual Try-On Studio
          </h1>
          <p className="text-sm text-stone-600">
            Upload your photo privately, compare before-and-after garment draping across {eligiblePublishedProducts.length} published marketplace styles, and add the right fit straight to your bag.
          </p>
        </div>

        <TryOnStudio
          eligibleProducts={eligiblePublishedProducts}
          initialProductId={initialProductId}
        />
      </div>
    </MarketplaceShell>
  );
}

export default function TryOnStudioPage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto"><ProductGridSkeleton /></div>}>
      <GlobalTryOnStudioContent />
    </Suspense>
  );
}

