'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';
import { BrandPartner } from '../../types';

interface BrandPartnersProps {
  brands: BrandPartner[];
  selectedBrand: string;
  onSelectBrand: (brandName: string) => void;
}

export function BrandPartners({ brands, selectedBrand, onSelectBrand }: BrandPartnersProps) {
  return (
    <section className="border-b border-gray-200 bg-white py-6 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Curated Boutique Partners</h2>
          <span className="text-xs text-black font-semibold">{brands.length} Independent Brands</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {brands.map(brand => (
            <div
              key={brand.slug}
              onClick={() => onSelectBrand(selectedBrand === brand.name ? 'All' : brand.name)}
              className={`p-4 rounded-2xl fashion-card border transition-all cursor-pointer flex items-center justify-between ${
                selectedBrand === brand.name ? 'border-gray-300 bg-gray-100 shadow-lg shadow-black/10' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10"
                />
                <div>
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    {brand.name}
                    <ShieldCheck className="w-3.5 h-3.5 text-black" />
                  </h3>
                  <p className="text-xs text-gray-500">{brand.tagline}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                  {brand.productCount} Garments
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
