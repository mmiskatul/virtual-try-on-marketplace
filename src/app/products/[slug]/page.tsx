'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Check,
  Heart,
  Maximize2,
  Ruler,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  X,
  ZoomIn,
} from 'lucide-react';
import { useProductDetailQuery } from '../../../hooks/useCatalogData';
import { useCartStore } from '../../../stores/useCartStore';
import { useMarketplaceStore } from '../../../stores/useMarketplaceStore';
import { useTryOnStore } from '../../../stores/useTryOnStore';
import { MarketplaceShell } from '../../../components/layout/MarketplaceShell';
import { Breadcrumb } from '../../../components/layout/Breadcrumb';
import { ProductGrid } from '../../../components/modules/ProductGrid';
import { EmptyState, ProductGridSkeleton, SafeImage } from '../../../components/ui/States';
import { Button } from '../../../components/ui/button';

type DetailTab =
  | 'description'
  | 'materials'
  | 'specs'
  | 'fit'
  | 'shipping'
  | 'returns'
  | 'reviews';

export default function ProductDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = String(params.slug || '');
  const contextBrand = searchParams.get('brand') || undefined;

  const { data, isLoading } = useProductDetailQuery(slug, contextBrand);
  const addToCart = useCartStore((s) => s.addToCart);
  const startTryOn = useTryOnStore((s) => s.startTryOn);

  const wishlistIds = useMarketplaceStore((s) => s.wishlistIds);
  const toggleWishlist = useMarketplaceStore((s) => s.toggleWishlist);
  const customReviews = useMarketplaceStore((s) => s.customReviews);
  const addReview = useMarketplaceStore((s) => s.addReview);

  const product = data?.product || null;

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>('description');
  const [reviewSort, setReviewSort] = useState<'helpful' | 'rating' | 'newest'>('helpful');

  // Review composer state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewFit, setReviewFit] = useState<'Runs Small' | 'True to Size' | 'Runs Large'>('True to Size');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const effectiveSize = selectedSize || product?.sizes?.[0] || 'M';
  const effectiveColor = selectedColor || product?.colors?.[0]?.name || 'Classic';

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const colorObj = product.colors?.find((c) => c.name === effectiveColor);
    const base = product.images?.length ? product.images : [product.image];
    if (colorObj?.image && !base.includes(colorObj.image)) {
      return [colorObj.image, ...base];
    }
    return base;
  }, [product, effectiveColor]);

  const currentImage = galleryImages[activeImageIdx] || product?.image || '';

  const allReviews = useMemo(() => {
    if (!product) return [];
    const combined = [
      ...customReviews.filter((r) => r.productId === product.id),
      ...(data?.reviews || []),
    ];
    return [...combined].sort((a, b) => {
      if (reviewSort === 'rating') return b.rating - a.rating;
      if (reviewSort === 'newest') return b.createdAt.localeCompare(a.createdAt);
      return b.helpfulCount - a.helpfulCount;
    });
  }, [product, customReviews, data?.reviews, reviewSort]);

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleWriteReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewName.trim() || !reviewBody.trim()) return;
    addReview({
      id: `rev_${Date.now()}`,
      productId: product.id,
      customerName: reviewName.trim(),
      rating: reviewRating,
      title: reviewTitle.trim() || 'Verified Customer Feedback',
      comment: reviewBody.trim(),
      verifiedPurchase: true,
      sizePurchased: effectiveSize,
      fitFeedback: reviewFit,
      helpfulCount: 1,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    setReviewName('');
    setReviewTitle('');
    setReviewBody('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  if (isLoading && !product) {
    return (
      <MarketplaceShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
          <ProductGridSkeleton count={4} />
        </div>
      </MarketplaceShell>
    );
  }

  if (!product) {
    return (
      <MarketplaceShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 w-full">
          <EmptyState
            title="Product Unavailable"
            description="This garment may have been unpublished, archived by the brand, or does not exist in the public marketplace."
            actionLabel="Explore Published Marketplace"
            actionHref="/discover"
          />
        </div>
      </MarketplaceShell>
    );
  }

  const wishlisted = wishlistIds.includes(product.id);
  const tryOnPageHref = data?.isStorefrontExclusive
    ? `/brands/${product.brandSlug}?tab=try-on&productId=${encodeURIComponent(product.id)}`
    : `/try-on?productId=${encodeURIComponent(product.id)}`;

  const matchedVariant =
    product.variants?.find(
      (v) => v.size === effectiveSize && v.color.toLowerCase() === effectiveColor.toLowerCase()
    ) || product.variants?.[0];

  const stockCount = matchedVariant?.stockQuantity ?? (product.inStock ? 10 : 0);

  return (
    <MarketplaceShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-12">
        <Breadcrumb
          items={[
            ...(data?.isStorefrontExclusive
              ? [{ label: product.brandName, href: `/brands/${product.brandSlug}` }]
              : [{ label: 'Discover', href: '/discover' }]),
            { label: product.category, href: `/discover?category=${encodeURIComponent(product.category)}` },
            { label: product.name },
          ]}
        />

        {/* Top Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 group">
              <SafeImage
                src={currentImage}
                alt={product.name}
                fill
                priority
                className={`object-cover transition-transform duration-500 ${
                  isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed((z) => !z)}
              />

              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoomed((z) => !z)}
                  aria-label="Toggle image zoom"
                  className="p-2.5 rounded-full bg-white/90 hover:bg-white border border-stone-200 shadow-sm text-stone-800"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Open full-screen viewer"
                  className="p-2.5 rounded-full bg-white/90 hover:bg-white border border-stone-200 shadow-sm text-stone-800"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveImageIdx(idx);
                      setIsZoomed(false);
                    }}
                    className={`relative w-20 h-24 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIdx === idx
                        ? 'border-stone-950 scale-105'
                        : 'border-stone-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <SafeImage src={imgUrl} alt={`${product.name} view ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details & Variations */}
          <div className="lg:col-span-5 space-y-6 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8">
            <div className="space-y-2.5 border-b border-stone-100 pb-5">
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/brands/${product.brandSlug}`}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-stone-950"
                >
                  <div className="relative w-6 h-6 rounded-full overflow-hidden border border-stone-200">
                    <SafeImage src={product.brandLogo} alt={product.brandName} fill className="object-cover" />
                  </div>
                  <span>{product.brandName}</span>
                  {product.brandVerified && <ShieldCheck className="w-4 h-4 text-emerald-700" />}
                </Link>

                {data?.isStorefrontExclusive && (
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-950 text-white text-[10px] font-bold">
                    Brand Storefront Exclusive
                  </span>
                )}
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="inline-flex items-center gap-1 font-bold text-stone-900">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-stone-500 font-normal">({product.reviewCount + customReviews.filter((r) => r.productId === product.id).length} reviews)</span>
                </div>
                <span className="text-stone-300">•</span>
                <span className="text-stone-500">{product.totalSold} sold</span>
                {product.sku && (
                  <>
                    <span className="text-stone-300">•</span>
                    <span className="font-mono text-[11px] text-stone-400">SKU: {product.sku}</span>
                  </>
                )}
              </div>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl font-extrabold text-stone-950">৳{product.price}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <>
                    <span className="text-base text-stone-400 line-through">৳{product.compareAtPrice}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                      Save {product.discountPercent}%
                    </span>
                  </>
                )}
              </div>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed">{product.description}</p>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Color: <span className="text-stone-950">{effectiveColor}</span>
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(c.name);
                        setActiveImageIdx(0);
                      }}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                        effectiveColor === c.name
                          ? 'border-stone-950 bg-stone-100 text-stone-950'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-500'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-stone-300" style={{ backgroundColor: c.hex }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection + Guide */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-stone-500">
                  Size: <span className="text-stone-950">{effectiveSize}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1 font-semibold text-stone-700 hover:text-stone-950 underline underline-offset-4"
                >
                  <Ruler className="w-3.5 h-3.5" /> Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[44px] px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      effectiveSize === s
                        ? 'bg-stone-950 text-white border-stone-950'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-900'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Availability */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="inline-flex items-center border border-stone-200 rounded-xl bg-stone-50">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-sm font-bold text-stone-700 hover:text-stone-950"
                >
                  −
                </button>
                <span className="px-3 text-xs font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="px-3 py-2 text-sm font-bold text-stone-700 hover:text-stone-950"
                >
                  +
                </button>
              </div>

              <span
                className={`text-xs font-semibold ${
                  product.inStock && stockCount > 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {product.inStock && stockCount > 0 ? 'Available for Immediate Dispatch' : 'Currently Out of Stock'}
              </span>
            </div>

            {/* Primary Try-On CTA */}
            {product.isTryOnEligible && (
              <div className="p-4 rounded-2xl bg-stone-950 text-white space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Virtual Fitting Ready
                  </span>
                  <Link
                    href={tryOnPageHref}
                    className="text-[11px] underline text-stone-300 hover:text-white"
                  >
                    Open Full Studio →
                  </Link>
                </div>
                <Button
                  type="button"
                  onClick={() =>
                    startTryOn(product, {
                      scopedBrandSlug: data?.isStorefrontExclusive ? product.brandSlug : undefined,
                    })
                  }
                  className="w-full h-11 rounded-xl bg-white hover:bg-stone-200 text-stone-950 font-bold text-xs gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Try It On With Your Photo
                </Button>
              </div>
            )}

            {/* Purchase & Secondary Actions */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  disabled={!product.inStock}
                  onClick={() => addToCart(product, effectiveSize, effectiveColor, quantity)}
                  className="h-12 rounded-2xl text-xs font-bold gap-2"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Cart
                </Button>

                <Button
                  variant="outline"
                  disabled={!product.inStock}
                  onClick={() => {
                    addToCart(product, effectiveSize, effectiveColor, quantity);
                    router.push('/checkout');
                  }}
                  className="h-12 rounded-2xl text-xs font-bold border-stone-900 text-stone-950"
                >
                  Buy Now
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => toggleWishlist(product.id)}
                  className="h-10 rounded-xl text-xs font-semibold gap-1.5"
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                  {wishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleShare}
                  className="h-10 rounded-xl text-xs font-semibold gap-1.5"
                >
                  {shareCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  {shareCopied ? 'Link Copied' : 'Share Product'}
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 text-xs text-stone-500 flex items-center gap-2">
              <Truck className="w-4 h-4 text-stone-700 shrink-0" />
              <span>{product.shippingPolicy || `Ships directly from ${product.brandName}`}</span>
            </div>
          </div>
        </div>

        {/* Structured Tabs (All 7 Requested Sections) */}
        <section className="rounded-3xl border border-stone-200 bg-white overflow-hidden">
          <div className="flex overflow-x-auto no-scrollbar border-b border-stone-200 px-4 sm:px-6 gap-6 text-xs font-bold">
            {(
              [
                ['description', 'Product Description'],
                ['materials', 'Materials & Fabric'],
                ['specs', 'Specifications'],
                ['fit', 'Size & Fit'],
                ['shipping', 'Shipping Information'],
                ['returns', 'Return Policy'],
                ['reviews', `Customer Reviews (${allReviews.length})`],
              ] as Array<[DetailTab, string]>
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`py-4 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === key
                    ? 'border-stone-950 text-stone-950'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8 text-sm text-stone-700 leading-relaxed">
            {activeTab === 'description' && (
              <div className="max-w-3xl space-y-3">
                <h3 className="font-serif text-xl font-bold text-stone-950">{product.name}</h3>
                <p>{product.description}</p>
                <p className="text-xs text-stone-500">
                  Crafted by <Link href={`/brands/${product.brandSlug}`} className="underline font-semibold text-stone-800">{product.brandName}</Link>. Every purchase is fulfilled directly by the independent brand seller.
                </p>
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="max-w-2xl space-y-2">
                <p className="font-bold text-stone-950">{product.fabric}</p>
                <p>{product.materialDetails || `${product.fabric}. Quality inspected by ${product.brandName}.`}</p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl text-xs">
                {Object.entries(product.specifications || { Fabric: product.fabric, Category: product.category }).map(
                  ([k, v]) => (
                    <div key={k} className="flex justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="font-semibold text-stone-500">{k}</span>
                      <span className="font-bold text-stone-900">{v}</span>
                    </div>
                  )
                )}
              </div>
            )}

            {activeTab === 'fit' && (
              <div className="max-w-2xl space-y-3">
                <p>{product.fitNotes || 'Cut to standard true-to-size tailoring proportions.'}</p>
                <Button size="sm" variant="outline" onClick={() => setSizeGuideOpen(true)}>
                  Open Measurement Chart
                </Button>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="max-w-2xl space-y-2">
                <p className="font-bold text-stone-950">Direct Brand Courier Dispatch</p>
                <p>{product.shippingPolicy || `Delivered by ${product.brandName}. Single-brand baskets over ৳1,500 ship free.`}</p>
              </div>
            )}

            {activeTab === 'returns' && (
              <div className="max-w-2xl space-y-2">
                <p className="font-bold text-stone-950">Independent Brand Return Guarantee</p>
                <p>{product.returnPolicy || 'Unworn items with intact labels may be returned or exchanged smoothly via Account -> Orders.'}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Rating Summary */}
                  <div className="lg:col-span-4 rounded-2xl bg-stone-50 border border-stone-200 p-5 space-y-4">
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif text-4xl font-bold text-stone-950">
                        {product.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-stone-500">out of 5 ({allReviews.length} visible reviews)</span>
                    </div>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const pct = star === 5 ? 82 : star === 4 ? 14 : star === 3 ? 4 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-6 font-bold">{star}★</span>
                          <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-8 text-right text-stone-500">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Review List & Sort */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-stone-950">Customer Reviews</h4>
                      <select
                        value={reviewSort}
                        onChange={(e) => setReviewSort(e.target.value as any)}
                        className="px-3 py-1.5 rounded-full border border-stone-200 text-xs font-semibold bg-white"
                      >
                        <option value="helpful">Most Helpful</option>
                        <option value="rating">Highest Rating</option>
                        <option value="newest">Newest</option>
                      </select>
                    </div>

                    {allReviews.length === 0 ? (
                      <p className="text-xs text-stone-500 p-6 rounded-2xl bg-stone-50 border border-stone-200">
                        No reviews written for this specific piece yet. Share your fit feedback below!
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {allReviews.map((r) => (
                          <div key={r.id} className="p-4 rounded-2xl border border-stone-200 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-stone-950">{r.customerName}</span>
                                {r.verifiedPurchase && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                    Verified Purchase
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-stone-400">{r.createdAt}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <div className="flex text-amber-400">
                                {Array.from({ length: r.rating }).map((_, i) => (
                                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                ))}
                              </div>
                              {r.fitFeedback && (
                                <span className="text-[11px] font-semibold text-stone-500">
                                  Fit: {r.fitFeedback}
                                </span>
                              )}
                            </div>
                            <p className="font-bold text-xs text-stone-900">{r.title}</p>
                            <p className="text-xs text-stone-600">{r.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Write a Review Form */}
                    <form onSubmit={handleWriteReview} className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 mt-4">
                      <h5 className="font-bold text-xs uppercase tracking-wider text-stone-900">
                        Write a Review
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <input
                          type="text"
                          required
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          placeholder="Your Name"
                          className="px-3 py-2 rounded-xl border border-stone-200 bg-white"
                        />
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className="px-3 py-2 rounded-xl border border-stone-200 bg-white"
                        >
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>{n} Stars</option>
                          ))}
                        </select>
                        <select
                          value={reviewFit}
                          onChange={(e) => setReviewFit(e.target.value as any)}
                          className="px-3 py-2 rounded-xl border border-stone-200 bg-white"
                        >
                          <option value="True to Size">Fit: True to Size</option>
                          <option value="Runs Small">Fit: Runs Small</option>
                          <option value="Runs Large">Fit: Runs Large</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="Review headline"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs"
                      />
                      <textarea
                        required
                        rows={3}
                        value={reviewBody}
                        onChange={(e) => setReviewBody(e.target.value)}
                        placeholder="How did the garment fit and drape?"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs"
                      />
                      <div className="flex items-center justify-between">
                        <Button type="submit" size="sm">Submit Review</Button>
                        {reviewSubmitted && (
                          <span className="text-xs font-bold text-emerald-700">Review added!</span>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Related from Same Brand */}
        {data && data.relatedSameBrand.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-stone-950">
                More from {product.brandName}
              </h2>
              <Link
                href={`/brands/${product.brandSlug}`}
                className="text-xs font-bold underline underline-offset-4 text-stone-900"
              >
                Visit Storefront →
              </Link>
            </div>
            <ProductGrid
              products={data.relatedSameBrand}
              brandStorefrontContextSlug={data.isStorefrontExclusive ? product.brandSlug : undefined}
              columns={4}
            />
          </section>
        )}

        {/* Similar Marketplace Items */}
        {data && data.similarCategory.length > 0 && (
          <section className="space-y-5">
            <h2 className="font-serif text-2xl font-bold text-stone-950">
              Customers Also Viewed
            </h2>
            <ProductGrid products={data.similarCategory} columns={4} />
          </section>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white text-stone-950"
            aria-label="Close fullscreen image"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative w-full max-w-2xl aspect-[3/4]">
            <SafeImage src={currentImage} alt={product.name} fill className="object-contain" />
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-lg">Standard Measurement Guide</h3>
              <button type="button" onClick={() => setSizeGuideOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500">
                    <th className="py-2">Size</th>
                    <th className="py-2">Chest (in)</th>
                    <th className="py-2">Waist (in)</th>
                    <th className="py-2">Hip (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {[
                    ['XS', '32–34', '25–26', '35–36'],
                    ['S', '35–36', '27–28', '37–38'],
                    ['M', '37–39', '29–31', '39–41'],
                    ['L', '40–42', '32–34', '42–44'],
                    ['XL', '43–45', '35–37', '45–47'],
                  ].map((row) => (
                    <tr key={row[0]}>
                      <td className="py-2 font-bold">{row[0]}</td>
                      <td className="py-2">{row[1]}</td>
                      <td className="py-2">{row[2]}</td>
                      <td className="py-2">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </MarketplaceShell>
  );
}

