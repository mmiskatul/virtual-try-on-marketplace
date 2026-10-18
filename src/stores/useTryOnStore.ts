import { create } from 'zustand';
import { MarketplaceProduct } from '../types';

export interface TryOnStore {
  activeProduct: MarketplaceProduct | null;
  phase: 'upload' | 'processing' | 'result';
  userUploadedPhoto: string | null;
  resultImageUrl: string;

  // Actions
  startTryOn: (product: MarketplaceProduct) => void;
  setTryOnPhase: (phase: 'upload' | 'processing' | 'result') => void;
  setUserUploadedPhoto: (photo: string) => void;
  setResultImageUrl: (url: string) => void;
  closeTryOn: () => void;
}

export const useTryOnStore = create<TryOnStore>((set) => ({
  activeProduct: null,
  phase: 'upload',
  userUploadedPhoto: null,
  resultImageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',

  startTryOn: (product) => set({ activeProduct: product, phase: 'upload' }),
  setTryOnPhase: (phase) => set({ phase }),
  setUserUploadedPhoto: (userUploadedPhoto) => set({ userUploadedPhoto }),
  setResultImageUrl: (resultImageUrl) => set({ resultImageUrl }),
  closeTryOn: () => set({ activeProduct: null, phase: 'upload' })
}));
