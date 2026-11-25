'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  Download,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { MarketplaceProduct, TryOnStudioState } from '../../types';
import { PRESET_MODEL_PHOTOS } from '../../data/catalogSeed';
import {
  checkTryOnProviderStatus,
  executeVirtualTryOn,
  TryOnProviderStatus,
  uploadCustomerTryOnPhoto,
} from '../../services';
import { useCartStore } from '../../stores/useCartStore';
import { useMarketplaceStore } from '../../stores/useMarketplaceStore';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { CameraCapture } from './CameraCapture';
import { SafeImage } from '../ui/States';
import { RealImage } from './RealImage';
import { Button } from '../ui/button';

interface TryOnStudioProps {
  /** Allowed garments for this studio (Brand Storefront passes ONLY that brand's eligible garments; Global passes published marketplace eligible garments). */
  eligibleProducts: MarketplaceProduct[];
  initialProductId?: string;
  scopedBrandName?: string;
  scopedBrandSlug?: string;
}

export function TryOnStudio({
  eligibleProducts,
  initialProductId,
  scopedBrandName,
  scopedBrandSlug,
}: TryOnStudioProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);
  const savedPhotos = useMarketplaceStore((s) => s.savedPhotos);
  const addSavedPhoto = useMarketplaceStore((s) => s.addSavedPhoto);
  const deleteSavedPhoto = useMarketplaceStore((s) => s.deleteSavedPhoto);
  const addTryOnRecord = useMarketplaceStore((s) => s.addTryOnRecord);
  const pushNotification = useMarketplaceStore((s) => s.pushNotification);
  const preferences = useMarketplaceStore((s) => s.preferences);
  const updatePreferences = useMarketplaceStore((s) => s.updatePreferences);

  const [providerStatus, setProviderStatus] = useState<TryOnProviderStatus>({
    connected: false,
    mode: 'offline',
    provider: 'checking',
    status: 'checking',
  });

  const [personPhoto, setPersonPhoto] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProductId && eligibleProducts.some((p) => p.id === initialProductId)
      ? initialProductId
      : eligibleProducts[0]?.id || ''
  );
  const [garmentCategoryFilter, setGarmentCategoryFilter] = useState<string>('All');
  const [garmentSearch, setGarmentSearch] = useState('');

  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('Classic');

  const [studioState, setStudioState] = useState<TryOnStudioState>('empty');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [resultMode, setResultMode] = useState<'live_ai' | 'demo_preview'>('demo_preview');
  const [resultNotice, setResultNotice] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    checkTryOnProviderStatus().then(setProviderStatus).catch(() => {});
  }, []);

  // Re-sync selected product safely if scoped catalog changes
  const selectedProduct = useMemo(
    () => eligibleProducts.find((p) => p.id === selectedProductId) || eligibleProducts[0] || null,
    [eligibleProducts, selectedProductId]
  );

  useEffect(() => {
    if (selectedProduct) {
      setSelectedSize(selectedProduct.sizes?.[0] || 'M');
      setSelectedColor(selectedProduct.colors?.[0]?.name || 'Classic');
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (studioState === 'processing' || studioState === 'success' || studioState === 'failed') return;
    if (personPhoto && selectedProduct) setStudioState('ready_to_generate');
    else if (personPhoto) setStudioState('image_uploaded');
    else if (selectedProduct) setStudioState('product_selected');
    else setStudioState('empty');
  }, [personPhoto, selectedProduct, studioState]);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(eligibleProducts.map((p) => p.category)))],
    [eligibleProducts]
  );

  const visibleGarments = useMemo(() => {
    return eligibleProducts.filter((p) => {
      // Strict isolation assertion
      if (scopedBrandSlug && p.brandSlug !== scopedBrandSlug) return false;
      const matchCat = garmentCategoryFilter === 'All' || p.category === garmentCategoryFilter;
      const matchQ =
        !garmentSearch.trim() ||
        p.name.toLowerCase().includes(garmentSearch.toLowerCase()) ||
        p.brandName.toLowerCase().includes(garmentSearch.toLowerCase());
      return matchCat && matchQ;
    });
  }, [eligibleProducts, scopedBrandSlug, garmentCategoryFilter, garmentSearch]);

  const handlePhotoUpload = async (file: File) => {
    if (!preferences.photoConsentGranted) {
      setErrorMsg('Please grant private photo processing consent before uploading your photo.');
      return;
    }
    setErrorMsg(null);
    setUploadProgress(35);
    const res = await uploadCustomerTryOnPhoto(file);
    setUploadProgress(100);
    setTimeout(() => setUploadProgress(0), 500);

    if (!res.ok || !res.url) {
      setErrorMsg(res.error || 'Could not process image file.');
      return;
    }

    setPersonPhoto(res.url);
    addSavedPhoto({ url: res.url, label: file.name.slice(0, 26) });
    if (studioState === 'success' || studioState === 'failed') {
      setStudioState('ready_to_generate');
    }
  };

  const activeColorImage =
    selectedProduct?.colors?.find((c) => c.name === selectedColor)?.image ||
    selectedProduct?.image ||
    '';

  const handleGenerate = async () => {
    if (!personPhoto || !selectedProduct) {
      setErrorMsg('Select both your photo and a garment before generating.');
      return;
    }
    setErrorMsg(null);
    setResultNotice(null);
    setStudioState('processing');

    try {
      const outcome = await executeVirtualTryOn({
        product: selectedProduct,
        personImage: personPhoto,
        garmentImage: activeColorImage,
        size: selectedSize,
        color: selectedColor,
      });

      if (!outcome.success) {
        setStudioState('failed');
        setErrorMsg(outcome.notice || 'The try-on could not be created. Please try again.');
        return;
      }

      setResultUrl(outcome.resultImageUrl);
      setResultMode(outcome.mode);
      setResultNotice(outcome.notice || null);
      setStudioState('success');

      addTryOnRecord({
        id: outcome.jobId,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productSlug: selectedProduct.slug,
        brandId: selectedProduct.brandId,
        brandName: selectedProduct.brandName,
        brandSlug: selectedProduct.brandSlug,
        garmentImageUrl: activeColorImage,
        personImageUrl: personPhoto,
        resultImageUrl: outcome.resultImageUrl,
        size: selectedSize,
        color: selectedColor,
        mode: outcome.mode,
        createdAt: new Date().toISOString(),
      });

      pushNotification({
        type: 'tryon',
        title: 'Virtual Try-On Ready',
        message: `${selectedProduct.name} fitting result saved to your history.`,
        href: '/account/try-on-history',
      });
    } catch {
      setStudioState('failed');
      setErrorMsg('Generation request failed. You can retry without re-uploading your photo.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Engine Connection + Isolation Notice Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              providerStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <span className="font-bold text-stone-900">
            {providerStatus.connected
              ? `Live AI Engine Connected (${providerStatus.mode === 'external_api' ? providerStatus.provider : 'VITON-HD'})`
              : 'Demo Preview Mode (Live Backend Offline)'}
          </span>
          {scopedBrandName && (
            <span className="px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 font-bold text-stone-800">
              Locked to {scopedBrandName} Catalog Only
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          Private session • Zero public photo exposure
        </span>
      </div>

      {/* 3-Panel Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Customer Photo & Guidance */}
        <div className="lg:col-span-4 fashion-card rounded-3xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-stone-950 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              1. Your Photo
            </h2>
            <span className="text-[11px] font-mono uppercase text-stone-400">
              {studioState.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Consent */}
          <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.photoConsentGranted}
              onChange={(e) => updatePreferences({ photoConsentGranted: e.target.checked })}
              className="mt-0.5 rounded accent-stone-950"
            />
            <span>
              I agree to process my photo privately for virtual fitting preview. Photos can be deleted anytime.
            </span>
          </label>

          {/* Drop Zone */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoUpload(file);
            }}
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handlePhotoUpload(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 ${
              isDragging
                ? 'border-stone-950 bg-stone-100'
                : 'border-stone-300 hover:border-stone-900 bg-stone-50/70'
            }`}
          >
            <Upload className="w-7 h-7 mx-auto text-stone-700" />
            <p className="text-xs font-bold text-stone-900">
              {personPhoto ? 'Replace Uploaded Photo' : 'Drag & Drop or Click to Upload'}
            </p>
            <p className="text-[11px] text-stone-500">
              JPG, PNG, or WebP up to 10MB
            </p>
            {uploadProgress > 0 && (
              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-stone-950 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setCameraOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white py-2.5 text-xs font-bold text-stone-900 hover:border-stone-900"
          >
            <Camera className="w-4 h-4" /> Or take a photo with your camera
          </button>
          <CameraCapture open={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={(f) => void handlePhotoUpload(f)} />

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Photo Guidance */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5 text-[11px] text-stone-600">
            <p className="font-bold text-stone-900">Best Try-On Results</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Use a clear, evenly lit portrait or full-body photo.</li>
              <li>Prefer a neutral front-facing standing pose.</li>
              <li>Avoid bags, scarves, or arms blocking the garment area.</li>
            </ul>
          </div>

          {/* Saved Customer Photos */}
          {savedPhotos.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Your Saved Photos
              </p>
              <div className="grid grid-cols-4 gap-2">
                {savedPhotos.map((sp) => (
                  <div key={sp.id} className="relative group">
                    <button
                      type="button"
                      onClick={() => setPersonPhoto(sp.url)}
                      className={`relative w-full aspect-[3/4] rounded-xl overflow-hidden border-2 ${
                        personPhoto === sp.url ? 'border-stone-950' : 'border-stone-200'
                      }`}
                    >
                      <SafeImage src={sp.url} alt={sp.label} fill className="object-cover" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteSavedPhoto(sp.id);
                        if (personPhoto === sp.url) setPersonPhoto(null);
                      }}
                      aria-label="Delete saved photo"
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preset Studio Models */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Or Try Quick Studio Models
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_MODEL_PHOTOS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setPersonPhoto(preset.url)}
                  className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                    personPhoto === preset.url
                      ? 'border-stone-950 ring-2 ring-stone-950 ring-offset-1'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                  title={preset.name}
                >
                  <SafeImage src={preset.thumb} alt={preset.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER PANEL: Main Preview & Comparison Canvas */}
        <div className="lg:col-span-4 fashion-card rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-stone-950">2. Fitting Canvas</h2>
            {studioState === 'success' && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live AI Synthesis
              </span>
            )}
          </div>

          {studioState === 'processing' && (
            <div className="aspect-[3/4] rounded-2xl bg-stone-950 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
              <div className="absolute inset-x-0 h-1 bg-amber-300/70 animate-scan-line" />
              <Sparkles className="w-10 h-10 text-amber-300 mb-3 animate-pulse" />
              <p className="font-serif text-xl font-bold">Synthesizing Fit...</p>
              <p className="text-xs text-stone-300 mt-1 max-w-xs">
                Warping {selectedProduct?.name} cleanly to your silhouette.
              </p>
            </div>
          )}

          {studioState === 'success' && personPhoto && (
            <div className="space-y-3">
              {resultNotice && (
                <p className="text-[11px] bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-3 py-2">
                  {resultNotice}
                </p>
              )}
              <BeforeAfterSlider
                beforeUrl={personPhoto}
                afterUrl={resultUrl}
                beforeLabel="Original"
                afterLabel="Virtual Fit"
              />
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={resultUrl}
                  download={`vtry-${selectedProduct?.slug || 'look'}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 hover:bg-stone-100"
                >
                  <Download className="w-3.5 h-3.5" /> Save Look
                </a>
                <Button
                  variant="outline"
                  onClick={() => setStudioState('retry')}
                  className="gap-1.5 text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Try New Fit
                </Button>
              </div>
            </div>
          )}

          {studioState === 'failed' && (
            <div className="aspect-[3/4] rounded-2xl border border-rose-200 bg-rose-50/40 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-rose-600" />
              <p className="font-bold text-sm text-stone-900">Generation Failed</p>
              <p className="text-xs text-stone-500">Click retry below to run this garment again.</p>
              <Button onClick={handleGenerate} size="sm" className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Retry Generation
              </Button>
            </div>
          )}

          {studioState !== 'processing' && studioState !== 'success' && studioState !== 'failed' && (
            <div className={`rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden relative flex items-center justify-center ${personPhoto ? '' : 'aspect-[3/4]'}`}>
              {personPhoto ? (
                <RealImage src={personPhoto} alt="Uploaded customer preview" className="block w-full h-auto max-h-[78vh] object-contain" />
              ) : (
                <div className="text-center p-6 space-y-2 max-w-xs">
                  <Sparkles className="w-9 h-9 text-stone-400 mx-auto" />
                  <p className="font-serif font-bold text-base text-stone-800">
                    Your Virtual Fitting Stage
                  </p>
                  <p className="text-xs text-stone-500">
                    Upload a photo or select a studio model on the left, choose any eligible garment on the right, and press Generate.
                  </p>
                </div>
              )}

              {selectedProduct && activeColorImage && (
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 border border-stone-200 shadow-lg flex items-center gap-3">
                  <div className="relative w-11 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                    <SafeImage src={activeColorImage} alt={selectedProduct.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase text-stone-500">Selected Garment</p>
                    <p className="text-xs font-bold text-stone-950 truncate">{selectedProduct.name}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Selected Product + Brand Isolation Selector */}
        <div className="lg:col-span-4 fashion-card rounded-3xl p-5 space-y-5">
          <h2 className="font-serif text-lg font-bold text-stone-950">
            3. Select Garment
          </h2>

          {selectedProduct ? (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/brands/${selectedProduct.brandSlug}`}
                    className="text-[11px] font-bold uppercase tracking-wider text-stone-500 hover:text-stone-950"
                  >
                    {selectedProduct.brandName}
                  </Link>
                  <h3 className="font-bold text-sm text-stone-950">{selectedProduct.name}</h3>
                </div>
                <span className="text-base font-extrabold text-stone-950">৳{selectedProduct.price}</span>
              </div>

              {/* Size & Color Settings */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {selectedProduct.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                        selectedSize === s
                          ? 'bg-stone-950 text-white border-stone-950'
                          : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProduct.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                        selectedColor === c.name
                          ? 'border-stone-950 bg-white'
                          : 'border-stone-200 bg-white/70 text-stone-600'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-stone-300" style={{ backgroundColor: c.hex }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  disabled={!personPhoto}
                  onClick={handleGenerate}
                  className="w-full text-xs font-bold gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Generate
                </Button>
                <Button
                  variant="outline"
                  disabled={!selectedProduct.inStock}
                  onClick={() => addToCart(selectedProduct, selectedSize, selectedColor)}
                  className="w-full text-xs font-bold gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Add to Cart
                </Button>
              </div>
              {!personPhoto && (
                <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Select or upload your photo in Step 1 to generate.
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-stone-500">No eligible try-on garments available in this scope.</p>
          )}

          {/* Eligible Garments Picker */}
          <div className="space-y-2.5">
            <input
              type="text"
              value={garmentSearch}
              onChange={(e) => setGarmentSearch(e.target.value)}
              placeholder={scopedBrandName ? `Search ${scopedBrandName} items...` : 'Filter eligible garments...'}
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-stone-900"
            />
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setGarmentCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap border ${
                    garmentCategoryFilter === cat
                      ? 'bg-stone-950 text-white border-stone-950'
                      : 'bg-white text-stone-600 border-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {visibleGarments.map((item) => {
                const active = item.id === selectedProduct?.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedProductId(item.id)}
                    className={`w-full text-left p-2.5 rounded-2xl border flex items-center gap-3 transition-all ${
                      active
                        ? 'border-stone-950 bg-stone-100/80 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-400'
                    }`}
                  >
                    <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                      <SafeImage src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase text-stone-500 truncate">
                        {item.brandName}
                      </p>
                      <p className="text-xs font-bold text-stone-900 truncate">{item.name}</p>
                      <p className="text-xs font-extrabold text-stone-950 mt-0.5">৳{item.price}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

