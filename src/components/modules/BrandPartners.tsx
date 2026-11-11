'use client';

import React from 'react';
import { BrandPartner } from '../../types';
import { BrandCard } from '../brand/BrandCard';

export function BrandPartners({ brands }: { brands: BrandPartner[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {brands.map((brand) => (
        <BrandCard key={brand.slug} brand={brand} />
      ))}
    </div>
  );
}
