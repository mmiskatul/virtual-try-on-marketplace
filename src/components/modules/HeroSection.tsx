import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { SafeImage } from '../ui/States';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-stone-200 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Editorial Left Copy */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-800 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Multi-Brand Fashion Marketplace</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight text-stone-950 leading-[1.08]">
            Fashion That Fits You Before You Buy.
          </h1>

          <p className="text-base text-stone-600 leading-relaxed max-w-xl">
            Discover your favorite styles, explore independent brands across curated storefronts, and experience AI-powered virtual try-on before making your next fashion decision.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              href="/discover"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-stone-950 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold shadow-lg shadow-stone-950/15 transition-all"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/try-on"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-stone-100 border border-stone-300 text-stone-950 text-xs sm:text-sm font-bold transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Try Virtual Fashion</span>
            </Link>
          </div>

          <div className="pt-4 grid grid-cols-3 gap-4 border-t border-stone-200 max-w-lg text-xs">
            <div>
              <p className="font-serif text-xl font-bold text-stone-950">12+</p>
              <p className="text-stone-500">Independent Brands</p>
            </div>
            <div>
              <p className="font-serif text-xl font-bold text-stone-950">45+</p>
              <p className="text-stone-500">Published Styles</p>
            </div>
            <div>
              <p className="font-serif text-xl font-bold text-stone-950 inline-flex items-center gap-1">
                <span>AI</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </p>
              <p className="text-stone-500">Virtual Fitting</p>
            </div>
          </div>
        </div>

        {/* Editorial Runway Collage */}
        <div className="lg:col-span-6 grid grid-cols-12 gap-4 items-center">
          <div className="col-span-7 relative aspect-[3/4] rounded-3xl overflow-hidden border border-stone-200 shadow-xl bg-white">
            <SafeImage
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80"
              alt="Editorial fashion model trying minimalist couture"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-sm flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Aura Atelier
                </p>
                <p className="text-xs font-bold text-stone-950 truncate">
                  Astral Silk Bias Slip Dress
                </p>
              </div>
              <Link
                href="/try-on?productId=prod_aura_dress_01"
                className="shrink-0 px-3 py-1.5 rounded-full bg-stone-950 text-white text-[11px] font-bold"
              >
                Try On
              </Link>
            </div>
          </div>

          <div className="col-span-5 space-y-4">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-stone-200 shadow-lg bg-white">
              <SafeImage
                src="https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800&auto=format&fit=crop&q=80"
                alt="Vogue Nova oversized blazer"
                fill
                className="object-cover"
              />
            </div>
            <Link
              href="/brands"
              className="block p-4 rounded-2xl bg-stone-950 text-white hover:bg-stone-800 transition-colors space-y-1"
            >
              <p className="text-[10px] uppercase tracking-widest text-stone-300 font-bold">
                Dedicated Storefronts
              </p>
              <p className="text-xs font-bold flex items-center justify-between">
                <span>Browse All Brands</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
