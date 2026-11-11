'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { usePublishedProductsQuery } from '../../hooks/useCatalogData';
import { getCategoriesWithCounts } from '../../services';
import { MarketplaceShell } from '../../components/layout/MarketplaceShell';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { SafeImage } from '../../components/ui/States';

export default function CategoriesPage() {
  const { data } = usePublishedProductsQuery();
  const categories = useMemo(
    () => getCategoriesWithCounts(data.products),
    [data.products]
  );

  return (
    <MarketplaceShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
        <Breadcrumb items={[{ label: 'Categories' }]} />

        <div className="space-y-2 max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">
            Marketplace Directory
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950">
            Browse All Fashion Categories
          </h1>
          <p className="text-sm text-stone-600">
            Explore curated published garments organized across menswear, womenswear, traditional Panjabis, sarees, denim, outerwear, and accessories.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/discover?category=${encodeURIComponent(cat.name)}`}
              className="group fashion-card rounded-3xl overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                <SafeImage
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 text-stone-900 text-[10px] font-bold">
                  {cat.group}
                </span>
              </div>
              <div className="p-5 flex items-end justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="font-serif text-xl font-bold text-stone-950">{cat.name}</h2>
                  <p className="text-xs text-stone-600 line-clamp-2">{cat.description}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-stone-950 shrink-0">
                  {cat.productCount} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MarketplaceShell>
  );
}

