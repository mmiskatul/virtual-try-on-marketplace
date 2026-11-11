'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react';
import { useMarketplaceStore } from '../../stores/useMarketplaceStore';
import { useMounted } from '../../hooks/useMounted';

export interface AnnouncementMessage {
  id: string;
  text: string;
  ctaLabel?: string;
  ctaHref?: string;
}

const DEFAULT_ANNOUNCEMENTS: AnnouncementMessage[] = [
  {
    id: 'eid_drop',
    text: 'Eid & Seasonal Collections Live — Explore 12+ Independent Fashion Brands',
    ctaLabel: 'Explore Collections',
    ctaHref: '/collections?collection=eid-collection',
  },
  {
    id: 'free_shipping',
    text: 'Complimentary Express Delivery on single-brand orders over $150',
    ctaLabel: 'Shop Discover',
    ctaHref: '/discover',
  },
  {
    id: 'promo_vtry10',
    text: 'New Customer Offer: Enjoy 10% off your first look with code VTRY10',
    ctaLabel: 'Shop Sale',
    ctaHref: '/discover?onSale=true',
  },
  {
    id: 'try_on_promo',
    text: 'See It On You Before You Buy — AI Virtual Try-On active on eligible garments',
    ctaLabel: 'Open Studio',
    ctaHref: '/try-on',
  },
];

export function AnnouncementBar({
  announcements = DEFAULT_ANNOUNCEMENTS,
}: {
  announcements?: AnnouncementMessage[];
}) {
  const mounted = useMounted();
  const dismissed = useMarketplaceStore((s) => s.announcementDismissed);
  const dismiss = useMarketplaceStore((s) => s.dismissAnnouncement);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % announcements.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  if (mounted && dismissed) return null;

  const active = announcements[index % announcements.length];

  return (
    <div className="bg-stone-950 text-stone-100 text-[11px] sm:text-xs py-2 px-4 relative z-50 border-b border-stone-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIndex((prev) => (prev - 1 + announcements.length) % announcements.length)}
          aria-label="Previous announcement"
          className="text-stone-400 hover:text-white p-1 hidden sm:inline-flex"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex-1 flex items-center justify-center gap-2 text-center truncate">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 hidden xs:inline" />
          <span className="truncate font-medium">{active.text}</span>
          {active.ctaHref && active.ctaLabel && (
            <Link
              href={active.ctaHref}
              className="underline underline-offset-4 font-semibold text-white hover:text-amber-200 shrink-0 ml-1"
            >
              {active.ctaLabel}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev + 1) % announcements.length)}
            aria-label="Next announcement"
            className="text-stone-400 hover:text-white p-1 hidden sm:inline-flex"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss announcement"
            className="text-stone-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

