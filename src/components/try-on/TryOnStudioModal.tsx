'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  ExternalLink,
  RefreshCw,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { MarketplaceProduct } from '../../types';
import { PRESET_MODEL_PHOTOS } from '../../data/catalogSeed';
import { executeVirtualTryOn, uploadCustomerTryOnPhoto } from '../../services';
import { useMarketplaceStore } from '../../stores/useMarketplaceStore';
import { useTryOnStore } from '../../stores/useTryOnStore';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { SafeImage } from '../ui/States';
import { Button } from '../ui/button';

interface TryOnStudioModalProps {
  product: MarketplaceProduct | null;
  phase: 'upload' | 'processing' | 'result' | 'error';
  resultImg: string;
  userPhoto?: string | null;
  onClose: () => void;
  onStartSynthesis?: () => void;
  onSelectPreset?: (presetUrl: string) => void;
  onUploadPhoto?: (photo: string) => void;
  onResetPhase: () => void;
  onAddToCart: (product: MarketplaceProduct, size?: string, color?: string) => void;
}

export function TryOnStudioModal({
  product,
  phase,
  resultImg,
  userPhoto,
  onClose,
  onResetPhase,
  onAddToCart,
}: TryOnStudioModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setTryOnPhase = useTryOnStore((s) => s.setTryOnPhase);
  const setUserUploadedPhoto = useTryOnStore((s) => s.setUserUploadedPhoto);
  const setResultImageUrl = useTryOnStore((s) => s.setResultImageUrl);
  const resultMode = useTryOnStore((s) => s.resultMode);
  const notice = useTryOnStore((s) => s.notice);
  const scopedBrandSlug = useTryOnStore((s) => s.scopedBrandSlug);

  const savedPhotos = useMarketplaceStore((s) => s.savedPhotos);
  const preferences = useMarketplaceStore((s) => s.preferences);
  const updatePreferences = useMarketplaceStore((s) => s.updatePreferences);
  const addSavedPhoto = useMarketplaceStore((s) => s.addSavedPhoto);
  const addTryOnRecord = useMarketplaceStore((s) => s.addTryOnRecord);

  const [size, setSize] = useState(product?.sizes?.[0] || 'M');
  const [color, setColor] = useState(product?.colors?.[0]?.name || 'Classic');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!product) return null;

  const activePhoto = userPhoto || savedPhotos[0]?.url || PRESET_MODEL_PHOTOS[0].url;
  const activeColorImg =
    product.colors?.find((c) => c.name === color)?.image || product.image;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!preferences.photoConsentGranted) {
      setUploadError('Please confirm photo processing consent before uploading your photo.');
      return;
    }
    setUploadError(null);
    setUploading(true);
    const uploaded = await uploadCustomerTryOnPhoto(file);
    setUploading(false);

    if (!uploaded.ok || !uploaded.url) {
      setUploadError(uploaded.error || 'Could not upload photo.');
      return;
    }

    setUserUploadedPhoto(uploaded.url);
    addSavedPhoto({ url: uploaded.url, label: file.name.slice(0, 28) });
  };

  const handleRunTryOn = async () => {
    setUploadError(null);
    setTryOnPhase('processing');
    try {
      const outcome = await executeVirtualTryOn({
        product,
        personImage: activePhoto,
        garmentImage: activeColorImg,
        size,
        color,
      });

      setResultImageUrl(outcome.resultImageUrl, outcome.mode, outcome.notice || null);
      addTryOnRecord({
        id: outcome.jobId,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        brandId: product.brandId,
        brandName: product.brandName,
        brandSlug: product.brandSlug,
        garmentImageUrl: activeColorImg,
        personImageUrl: activePhoto,
        resultImageUrl: outcome.resultImageUrl,
        size,
        color,
        mode: outcome.mode,
        createdAt: new Date().toISOString(),
      });
      setTryOnPhase('result');
    } catch {
      setTryOnPhase('error');
    }
  };

  const studioUrl = scopedBrandSlug
    ? `/brands/${encodeURIComponent(scopedBrandSlug)}?tab=try-on&productId=${encodeURIComponent(product.id)}`
    : `/try-on?productId=${encodeURIComponent(product.id)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-7 space-y-5 relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Virtual Try-On modal"
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-950"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start justify-between pr-8">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-stone-950 text-amber-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-950">AI Virtual Try-On</h3>
              <p className="text-xs text-stone-500">
                Garment owned by <span className="font-semibold text-stone-800">{product.brandName}</span>
              </p>
            </div>
          </div>
          <Link
            href={studioUrl}
            onClick={onClose}
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-950 underline underline-offset-4"
          >
            Full Studio <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Locked Garment Summary */}
        <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-stone-200">
              <SafeImage src={activeColorImg} alt={product.name} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                {product.brandName}
              </p>
              <p className="text-xs font-bold text-stone-950 truncate">{product.name}</p>
              <p className="text-xs text-stone-600 font-semibold mt-0.5">
                ${product.price} • Size {size} • {color}
              </p>
            </div>
          </div>
        </div>

        {phase === 'upload' && (
          <div className="space-y-4">
            {/* Variant quick selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-bold text-stone-600 mb-1.5">Size</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`px-2.5 py-1 rounded-lg border font-semibold ${
                        size === s
                          ? 'bg-stone-950 text-white border-stone-950'
                          : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-bold text-stone-600 mb-1.5">Colorway</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColor(c.name)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                        color === c.name
                          ? 'border-stone-950 bg-stone-100 text-stone-950'
                          : 'border-stone-200 bg-white text-stone-700'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-stone-300" style={{ backgroundColor: c.hex }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Privacy Consent */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.photoConsentGranted}
                onChange={(e) => updatePreferences({ photoConsentGranted: e.target.checked })}
                className="mt-0.5 rounded accent-stone-950"
              />
              <span>
                I consent to process my uploaded photo solely for this private virtual try-on session. Photos are never made public.
              </span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Active Photo Preview / Uploader */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-stone-950 rounded-2xl p-5 text-center cursor-pointer bg-stone-50 transition-colors space-y-2"
              >
                <Upload className="w-6 h-6 mx-auto text-stone-700" />
                <p className="text-xs font-bold text-stone-900">
                  {uploading ? 'Uploading photo...' : 'Upload Your Photo'}
                </p>
                <p className="text-[11px] text-stone-500">
                  Front-facing, clear lighting, unobstructed garment area (JPG/PNG up to 10MB).
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Active Subject Photo
                </p>
                <div className="flex items-center gap-3 p-2.5 rounded-2xl border border-stone-200 bg-white">
                  <div className="relative w-14 h-16 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                    <SafeImage src={activePhoto} alt="Subject preview" fill className="object-cover" />
                  </div>
                  <div className="text-xs space-y-1">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5" /> Ready
                    </span>
                    <p className="text-[11px] text-stone-500">Or select a studio model below:</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {PRESET_MODEL_PHOTOS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setUserUploadedPhoto(preset.url)}
                      className={`relative w-11 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                        activePhoto === preset.url ? 'border-stone-950 scale-105' : 'border-stone-200 opacity-75 hover:opacity-100'
                      }`}
                      title={preset.name}
                    >
                      <SafeImage src={preset.thumb} alt={preset.name} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {uploadError && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                {uploadError}
              </p>
            )}

            <Button onClick={handleRunTryOn} className="w-full h-11 rounded-2xl text-xs font-bold gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Generate Virtual Try-On
            </Button>
          </div>
        )}

        {phase === 'processing' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-stone-200 border-t-stone-950 animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="font-serif font-bold text-lg text-stone-950">Draping Garment...</p>
              <p className="text-xs text-stone-500">
                Aligning pose keypoints and fabric silhouette for {product.name}
              </p>
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div className="py-8 text-center space-y-4">
            <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto" />
            <div>
              <h4 className="font-bold text-sm text-stone-900">Try-On Generation Interrupted</h4>
              <p className="text-xs text-stone-500 mt-1">
                We couldn&apos;t complete this generation right now. Please retry with another photo or studio model.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={onResetPhase}>
                Change Photo
              </Button>
              <Button onClick={handleRunTryOn} className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Retry Generation
              </Button>
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                  resultMode === 'live_ai'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {resultMode === 'live_ai' ? 'Live AI Synthesis Complete' : 'Demo Preview Mode'}
              </span>
              <span className="text-[11px] text-stone-500">Drag slider to compare fit & drape</span>
            </div>

            {notice && (
              <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                {notice}
              </p>
            )}

            <div className="max-w-sm mx-auto">
              <BeforeAfterSlider
                beforeUrl={activePhoto}
                afterUrl={resultImg || activeColorImg}
                beforeLabel="Original"
                afterLabel="Virtual Fit"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="outline" onClick={onResetPhase} className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Try Another Photo
              </Button>
              <Button
                onClick={() => {
                  onAddToCart(product, size, color);
                  onClose();
                }}
                className="gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart • ${product.price}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
