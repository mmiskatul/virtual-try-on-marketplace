import { MarketplaceProduct } from '../types';
import { store } from '../store';
import { createSliceFacadeHook } from '../store/hooks';
import { selectTryOnState } from '../store/selectors';
import { tryOnActions } from '../store/slices/tryOnSlice';

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

const tryOnBoundActions = {
  startTryOn: (product: MarketplaceProduct, options?: { scopedBrandSlug?: string }) => {
    store.dispatch(
      tryOnActions.startTryOn({ product, scopedBrandSlug: options?.scopedBrandSlug })
    );
  },
  setTryOnPhase: (phase: 'upload' | 'processing' | 'result' | 'error') => {
    store.dispatch(tryOnActions.setTryOnPhase(phase));
  },
  setUserUploadedPhoto: (photo: string | null) => {
    store.dispatch(tryOnActions.setUserUploadedPhoto(photo));
  },
  setResultImageUrl: (
    url: string,
    mode: 'live_ai' | 'demo_preview' = 'demo_preview',
    notice: string | null = null
  ) => {
    store.dispatch(tryOnActions.setResultImageUrl({ url, mode, notice }));
  },
  setVariantChoice: (size: string, color: string) => {
    store.dispatch(tryOnActions.setVariantChoice({ size, color }));
  },
  closeTryOn: () => {
    store.dispatch(tryOnActions.closeTryOn());
  },
};

export const useTryOnStore = createSliceFacadeHook(selectTryOnState, tryOnBoundActions);
