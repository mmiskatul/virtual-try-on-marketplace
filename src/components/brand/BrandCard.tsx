'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Star, Users } from 'lucide-react';
import { BrandPartner } from '../../types';
import { useMarketplaceStore } from '../../stores/useMarketplaceStore';
import { useMounted } from '../../hooks/useMounted';
import { SafeImage } from '../ui/States';

export function BrandCard({ brand }: { brand: BrandPartner }) {
  const mounted = useMounted();
  const isFollowing = useMarketplaceStore((s) => s.followedBrandSlugs.includes(brand.slug));
  const toggleFollow = useMarketplaceStore((s) => s.toggleFollowBrand);

  const following = mounted && isFollowing;
  const followerDisplay = brand.totalFollowers + (following ? 1 : 0);

  return (
    <article className="fashion-card rounded-2xl overflow-hidden flex flex-col justify-between group">
      {/* Cover Image */}
      <Link href={`/brands/${brand.slug}`} className="block relative h-36 bg-stone-100 overflow-hidden">
        <SafeImage
          src={brand.coverImage}
          alt={`${brand.name} studio cover`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2.5">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-white border-2 border-white shadow">
            <SafeImage src={brand.logo} alt={brand.name} fill className="object-cover" />
          </div>
          <div className="text-white">
            <h3 className="font-bold text-sm flex items-center gap-1 leading-tight">
              <span>{brand.name}</span>
              {brand.verificationStatus === 'VERIFIED' && (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              )}
            </h3>
            <p className="text-[11px] text-white/80">{brand.originCity}</p>
          </div>
        </div>
      </Link>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold">
            <span>{brand.categoryFocus}</span>
            <span className="inline-flex items-center gap-1 text-stone-900 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {brand.rating.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{brand.description}</p>
        </div>

        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="text-[11px] text-stone-500 flex items-center gap-3">
            <span className="font-bold text-stone-800">{brand.productCount} Items</span>
            <span className="inline-flex items-center gap-1">
              <Users className="w-3 h-3" />
              {(followerDisplay / 1000).toFixed(1)}k
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleFollow(brand.slug)}
              className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${
                following
                  ? 'bg-stone-100 border-stone-300 text-stone-900'
                  : 'bg-white border-stone-200 text-stone-700 hover:border-stone-900'
              }`}
            >
              {following ? 'Following' : 'Follow'}
            </button>
            <Link
              href={`/brands/${brand.slug}`}
              className="px-3 py-1.5 rounded-full bg-stone-950 hover:bg-stone-800 text-white text-[11px] font-bold transition-colors"
            >
              Visit Store
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

