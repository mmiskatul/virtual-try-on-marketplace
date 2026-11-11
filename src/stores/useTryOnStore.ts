import { create } from 'zustand';
import { MarketplaceProduct } from '../types';

export interface TryOnStore {
  activeProduct: MarketplaceProduct | null;
  scopedBrandSlug: string | null;
  phase: 'upload' | 'processing' | 'result' | 'error';
  userUploadedPhoto: string | null;
  resultImageUrl: string;
  selectedSize: string;
  selectedColor: string;
  resultMode: 'live_ai' | 'demo_preview';
  notice: string | null;

  startTryOn: (product: MarketplaceProduct, options?: { scopedBrandSlug?: string }) => void;
  setTryOnPhase: (phase: 'upload' | 'processing' | 'result' | 'error') => void;
  setUserUploadedPhoto: (photo: string | null) => void;
  setResultImageUrl: (url: string, mode?: 'live_ai' | 'demo_preview', notice?: string | null) => void;
  setVariantChoice: (size: string, color: string) => void;
  closeTryOn: () => void;
}

export const useTryOnStore = create<TryOnStore>((set) => ({
  activeProduct: null,
  scopedBrandSlug: null,
  phase: 'upload',
  userUploadedPhoto: null,
  resultImageUrl: '',
  selectedSize: 'M',
  selectedColor: 'Classic',
  resultMode: 'demo_preview',
  notice: null,

  startTryOn: (product, options) =>
    set({
      activeProduct: product,
      scopedBrandSlug: options?.scopedBrandSlug || null,
      phase: 'upload',
      selectedSize: product.sizes?.[0] || 'M',
      selectedColor: product.colors?.[0]?.name || 'Classic',
      resultImageUrl: product.image,
      notice: null,
    }),

  setTryOnPhase: (phase) => set({ phase }),
  setUserUploadedPhoto: (userUploadedPhoto) => set({ userUploadedPhoto }),
  setResultImageUrl: (resultImageUrl, resultMode = 'demo_preview', notice = null) =>
    set({ resultImageUrl, resultMode, notice }),
  setVariantChoice: (selectedSize, selectedColor) => set({ selectedSize, selectedColor }),
  closeTryOn: () => set({ activeProduct: null, scopedBrandSlug: null, phase: 'upload', notice: null }),
}));
