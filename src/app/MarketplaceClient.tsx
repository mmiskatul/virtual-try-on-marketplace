'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { CUSTOMER_TESTIMONIALS } from '../data/catalogSeed';
import { useBrandsDirectoryQuery, usePublishedProductsQuery } from '../hooks/useCatalogData';
import {
  filterAndSortProducts,
  getCategoriesWithCounts,
  getCollectionsWithCounts,
} from '../services';
import { MarketplaceShell } from '../components/layout/MarketplaceShell';
import { HeroSection } from '../components/modules/HeroSection';
import { ProductGrid } from '../components/modules/ProductGrid';
import { BrandPartners } from '../components/modules/BrandPartners';
import { BeforeAfterSlider } from '../components/try-on/BeforeAfterSlider';
import { EditorialSectionHeader, ProductGridSkeleton, SafeImage } from '../components/ui/States';
import { Button } from '../components/ui/button';

export function MarketplaceClient() {
  const { data: catalogData, isLoading } = usePublishedProductsQuery();
  const { data: brands } = useBrandsDirectoryQuery();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterState, setNewsletterState] = useState<'idle' | 'error' | 'subscribed'>('idle');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  // Strict global marketplace pool (ONLY PUBLISHED items)
  const publishedProducts = catalogData.products;

  const categories = useMemo(
    () => getCategoriesWithCounts(publishedProducts),
    [publishedProducts]
  );

  const collections = useMemo(
    () => getCollectionsWithCounts(publishedProducts),
    [publishedProducts]
  );

  const featuredProducts = useMemo(
    () =>
      filterAndSortProducts(publishedProducts, {
        sortBy: 'recommended',
        limit: 8,
      }).items,
    [publishedProducts]
  );

  const trendingProducts = useMemo(
    () =>
      filterAndSortProducts(publishedProducts, {
        sortBy: 'popular',
        limit: 4,
      }).items,
    [publishedProducts]
  );

  const newArrivals = useMemo(
    () =>
      filterAndSortProducts(publishedProducts, {
        sortBy: 'newest',
        limit: 4,
      }).items,
    [publishedProducts]
  );

  const featuredBrands = useMemo(
    () => brands.filter((b) => b.isFeatured).slice(0, 6),
    [brands]
  );

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newsletterEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setNewsletterState('error');
      setNewsletterMsg('Please enter a valid email address.');
      return;
    }
    setNewsletterState('subscribed');
    setNewsletterMsg(`Subscribed ${clean} for weekly designer drops & early collection access.`);
    setNewsletterEmail('');
  };

  return (
    <MarketplaceShell>
      {/* Section 3: Editorial Hero */}
      <HeroSection />

      {/* Section 4: Shop by Category (12 Data-Driven Categories) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-8 w-full">
        <EditorialSectionHeader
          eyebrow="Curated Taxonomy"
          title="Shop by Category"
          subtitle="Browse tailored silhouettes across independent labels—from handloom heritage Panjabis and Sarees to contemporary outerwear."
          actionLabel="View All Categories"
          actionHref="/categories"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/discover?category=${encodeURIComponent(cat.name)}`}
              className="group rounded-2xl overflow-hidden border border-stone-200 bg-white hover:border-stone-900 transition-all flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                <SafeImage
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 16vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-stone-900 truncate">{cat.name}</span>
                <span className="text-[11px] font-semibold text-stone-500 shrink-0">
                  {cat.productCount || 0}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 5: Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 w-full">
        <EditorialSectionHeader
          eyebrow="Marketplace Highlights"
          title="Featured Pieces Across Brands"
          subtitle="Explicitly published styles curated from verified independent storefronts. Every item retains full brand provenance."
          actionLabel="Discover All Looks"
          actionHref="/discover"
        />

        {isLoading && publishedProducts.length === 0 ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <ProductGrid products={featuredProducts} columns={4} />
        )}
      </section>

      {/* Section 6: Dedicated Virtual Try-On Experience */}
      <section className="bg-stone-950 text-white py-16 px-4 sm:px-6 my-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold uppercase tracking-widest text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive AI Fitting Room
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
              See It On You. Before You Buy.
            </h2>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl">
              Upload a front-facing portrait once and preview how silks, structured blazers, Panjabis, Sarees, and denim drape across your real silhouette in seconds.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {[
                { step: '01', title: 'Upload Photo', desc: 'Private, consent-first processing with one-click delete.' },
                { step: '02', title: 'Pick Garment', desc: 'Try any eligible dress, shirt, hoodie, saree, or jacket.' },
                { step: '03', title: 'Compare Fit', desc: 'Slide Before vs After before choosing your size.' },
              ].map((s) => (
                <div key={s.step} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[11px] font-mono text-amber-300 font-bold">{s.step}</span>
                  <p className="text-xs font-bold text-white">{s.title}</p>
                  <p className="text-[11px] text-stone-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/try-on"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-stone-950 hover:bg-stone-200 text-xs font-bold transition-colors"
              >
                <Camera className="w-4 h-4" />
                Upload Photo &amp; Try On
              </Link>
              <Link
                href="/discover?tryOnOnly=true"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/25 text-white hover:bg-white/10 text-xs font-bold transition-colors"
              >
                Browse Try-On Eligible Items
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-[11px] text-stone-400">
              Supported categories: Tops, Shirts, T-Shirts, Hoodies, Panjabis, Dresses, Sarees, Outerwear &amp; Bottoms.
            </p>
          </div>

          <div className="lg:col-span-6 max-w-md mx-auto w-full bg-white p-4 rounded-3xl shadow-2xl text-stone-900">
            <BeforeAfterSlider
              beforeUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&auto=format&fit=crop&q=80"
              afterUrl="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=700&auto=format&fit=crop&q=80"
              beforeLabel="Original Portrait"
              afterLabel="Silk Dress Preview"
            />
          </div>
        </div>
      </section>

      {/* Section 7: Featured Brands */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8 w-full">
        <EditorialSectionHeader
          eyebrow="Independent Partners"
          title="Featured Brand Storefronts"
          subtitle="Visit each brand’s dedicated storefront to explore their complete customer-facing catalog and brand-exclusive drops."
          actionLabel="Explore Brand Directory"
          actionHref="/brands"
        />

        <BrandPartners brands={featuredBrands} />
      </section>

      {/* Section 8: Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 w-full">
        <EditorialSectionHeader
          eyebrow="Community Momentum"
          title="Trending Now"
          subtitle="Ranked by customer favorites, orders, and recent virtual fitting activity."
          actionLabel="View All Trending"
          actionHref="/discover?productType=trending&sortBy=popular"
        />

        <ProductGrid products={trendingProducts} columns={4} />
      </section>

      {/* Section 9: New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 w-full">
        <EditorialSectionHeader
          eyebrow="Freshly Published"
          title="New Arrivals"
          subtitle="Latest releases explicitly published to the global marketplace, sorted by publication date."
          actionLabel="Shop All New Arrivals"
          actionHref="/discover?productType=new&sortBy=newest"
        />

        <ProductGrid products={newArrivals} columns={4} />
      </section>

      {/* Section 10: Collections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-8 w-full">
        <EditorialSectionHeader
          eyebrow="Seasonal Edits"
          title="Curated Collections"
          subtitle="Explore thematic wardrobes curated across participating brands."
          actionLabel="All Collections"
          actionHref="/collections"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {collections.slice(0, 4).map((col) => (
            <Link
              key={col.id}
              href={`/collections?collection=${encodeURIComponent(col.slug)}`}
              className="group relative aspect-[4/5] rounded-3xl overflow-hidden border border-stone-200 bg-stone-900"
            >
              <SafeImage
                src={col.image}
                alt={col.name}
                fill
                className="object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                  {col.season} • {col.productCount} Looks
                </span>
                <h3 className="font-serif text-xl font-bold">{col.name}</h3>
                <p className="text-xs text-white/80 line-clamp-2">{col.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 11: Customer Reviews & Testimonials */}
      <section className="bg-white border-y border-stone-200 py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <EditorialSectionHeader
            eyebrow="Verified Fit Feedback"
            title="Trusted by Modern Shoppers"
            subtitle="Real experiences pairing virtual try-on previews with independent brand craftsmanship."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CUSTOMER_TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="rounded-3xl border border-stone-200 bg-[#FAF9F6] p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed">&ldquo;{t.comment}&rdquo;</p>
                </div>

                <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-stone-200">
                      <SafeImage src={t.avatar} alt={t.customerName} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-950 truncate">{t.customerName}</p>
                      <Link
                        href={`/products/${t.productSlug}`}
                        className="text-[11px] text-stone-500 hover:text-stone-900 truncate block underline underline-offset-2"
                      >
                        {t.productName} ({t.brandName})
                      </Link>
                    </div>
                  </div>
                  {t.verifiedPurchase && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold shrink-0">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 12: Newsletter */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 w-full">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-12 text-center space-y-5 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-stone-950 text-white flex items-center justify-center mx-auto">
            <Mail className="w-5 h-5" />
          </div>
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950">
              First Access to New Brand Drops
            </h2>
            <p className="text-sm text-stone-600">
              Join our weekly editorial letter for curated seasonal releases, independent label spotlights, and private fitting invites.
            </p>
          </div>

          <form
            onSubmit={handleNewsletterSubmit}
            className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto pt-2"
          >
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              aria-label="Email address for newsletter"
              className="flex-1 px-4 py-3 rounded-full border border-stone-300 text-xs focus:outline-none focus:border-stone-950"
            />
            <Button type="submit" className="h-11 px-6 rounded-full text-xs font-bold">
              Subscribe
            </Button>
          </form>

          {newsletterState === 'error' && (
            <p className="text-xs font-semibold text-rose-600">{newsletterMsg}</p>
          )}
          {newsletterState === 'subscribed' && (
            <p className="text-xs font-semibold text-emerald-700 inline-flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{newsletterMsg}</span>
            </p>
          )}
        </div>
      </section>
    </MarketplaceShell>
  );
}
