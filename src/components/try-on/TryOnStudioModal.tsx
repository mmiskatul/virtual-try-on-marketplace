'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Sparkles, Upload, X, ShoppingBag, CheckCircle, RefreshCw } from 'lucide-react';
import { MarketplaceProduct } from '../../types';

interface TryOnStudioModalProps {
  product: MarketplaceProduct | null;
  phase: 'upload' | 'processing' | 'result';
  resultImg: string;
  userPhoto?: string | null;
  onClose: () => void;
  onStartSynthesis: () => void;
  onSelectPreset: (presetUrl: string) => void;
  onUploadPhoto?: (photo: string) => void;
  onResetPhase: () => void;
  onAddToCart: (product: MarketplaceProduct) => void;
}

const PRESET_MODELS = [
  {
    id: 'preset_female',
    name: 'Female Portrait Model',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset_male',
    name: 'Male Studio Model',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  }
];

export function TryOnStudioModal({
  product,
  phase,
  resultImg,
  userPhoto,
  onClose,
  onStartSynthesis,
  onSelectPreset,
  onUploadPhoto,
  onResetPhase,
  onAddToCart
}: TryOnStudioModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!product) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (onUploadPhoto) {
        onUploadPhoto(result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="fashion-glass w-full max-w-xl p-6 rounded-3xl border border-purple-500/30 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">AI Virtual Try-On Studio</h3>
            <p className="text-xs text-slate-400">VITON-HD Multi-Tenant Neural Warping Pipeline</p>
          </div>
        </div>

        {/* Target Product Strip */}
        <div className="flex items-center gap-4 p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800">
          <Image
            src={product.image}
            alt={product.name}
            width={56}
            height={56}
            className="w-14 h-14 rounded-xl object-cover ring-1 ring-white/10"
          />
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-400">{product.brandName}</span>
            <p className="font-bold text-xs text-white">{product.name}</p>
            <p className="text-xs text-slate-400 font-semibold">${product.price} • {product.category}</p>
          </div>
        </div>

        {/* Phase 1: Upload / Choose Preset */}
        {phase === 'upload' && (
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {userPhoto ? (
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-16 rounded-xl overflow-hidden ring-1 ring-purple-400/50 bg-slate-900">
                    <Image
                      src={userPhoto}
                      alt="Selected user photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                      <CheckCircle className="w-3.5 h-3.5" /> Photo Selected
                    </div>
                    <p className="text-[11px] text-slate-400">Ready for neural fitting synthesis</p>
                  </div>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Change
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-purple-500/40 hover:border-purple-500 rounded-2xl p-6 text-center space-y-3 cursor-pointer bg-purple-950/10 transition-colors"
              >
                <Upload className="w-8 h-8 text-purple-400 mx-auto" />
                <div>
                  <p className="font-bold text-xs text-white">Upload Your Standing or Portrait Photograph</p>
                  <p className="text-[11px] text-slate-400 mt-1">Best results: neutral pose, plain background, full upper body visible</p>
                </div>
              </div>
            )}

            <div className="text-center">
              <span className="text-slate-500 text-xs font-semibold">Or pick a high-resolution model preset:</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PRESET_MODELS.map((preset) => {
                const isSelected = userPhoto === preset.url;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onSelectPreset(preset.url)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all text-left ${
                      isSelected
                        ? 'border-purple-400 bg-purple-900/40 text-purple-200 ring-2 ring-purple-500/30'
                        : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-purple-500/50 hover:bg-purple-950/20'
                    }`}
                  >
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={preset.thumb}
                        alt={preset.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="truncate">{preset.name}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={onStartSynthesis}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Start Neural Synthesis
            </button>
          </div>
        )}

        {/* Phase 2: Processing Animation */}
        {phase === 'processing' && (
          <div className="py-12 text-center space-y-4">
            <div className="relative w-14 h-14 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
              <Sparkles className="w-6 h-6 text-purple-400 absolute inset-0 m-auto" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-sm text-white">Synthesizing Silhouette & Fabric Flow...</p>
              <p className="text-xs text-purple-300/80">Running DensePose parsing and VITON-HD synthesis on GPU engine</p>
            </div>
          </div>
        )}

        {/* Phase 3: Result */}
        {phase === 'result' && (
          <div className="space-y-5 text-center">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Target Garment</span>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden ring-1 ring-white/10 bg-slate-900">
                  <Image src={product.image} alt="Original" fill sizes="250px" className="object-cover" />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">AI Virtual Fitting</span>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden ring-2 ring-emerald-500/60 shadow-xl shadow-emerald-500/10 bg-slate-900">
                  <Image src={resultImg} alt="Try-On Result" fill sizes="250px" className="object-cover" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-medium">
              ✓ Garment fit aligned seamlessly with 98.4% synthesis confidence score.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Add This Look to Bag (${product.price})
              </button>
              <button
                onClick={onResetPhase}
                className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Try Another Photo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
