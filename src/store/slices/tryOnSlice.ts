import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MarketplaceProduct } from '../../types';

export interface TryOnSliceState {
  activeProduct: MarketplaceProduct | null;
  scopedBrandSlug: string | null;
  phase: 'upload' | 'processing' | 'result' | 'error';
  userUploadedPhoto: string | null;
  resultImageUrl: string;
  selectedSize: string;
  selectedColor: string;
  resultMode: 'live_ai' | 'demo_preview';
  notice: string | null;
}

const initialState: TryOnSliceState = {
  activeProduct: null,
  scopedBrandSlug: null,
  phase: 'upload',
  userUploadedPhoto: null,
  resultImageUrl: '',
  selectedSize: 'M',
  selectedColor: 'Classic',
  resultMode: 'demo_preview',
  notice: null,
};

export const tryOnSlice = createSlice({
  name: 'tryOn',
  initialState,
  reducers: {
    startTryOn: (
      state,
      action: PayloadAction<{ product: MarketplaceProduct; scopedBrandSlug?: string }>
    ) => {
      const { product, scopedBrandSlug } = action.payload;
      state.activeProduct = product;
      state.scopedBrandSlug = scopedBrandSlug || null;
      state.phase = 'upload';
      state.selectedSize = product.sizes?.[0] || 'M';
      state.selectedColor = product.colors?.[0]?.name || 'Classic';
      state.resultImageUrl = product.image;
      state.notice = null;
    },
    setTryOnPhase: (state, action: PayloadAction<'upload' | 'processing' | 'result' | 'error'>) => {
      state.phase = action.payload;
    },
    setUserUploadedPhoto: (state, action: PayloadAction<string | null>) => {
      state.userUploadedPhoto = action.payload;
    },
    setResultImageUrl: (
      state,
      action: PayloadAction<{
        url: string;
        mode?: 'live_ai' | 'demo_preview';
        notice?: string | null;
      }>
    ) => {
      state.resultImageUrl = action.payload.url;
      state.resultMode = action.payload.mode ?? 'demo_preview';
      state.notice = action.payload.notice ?? null;
    },
    setVariantChoice: (state, action: PayloadAction<{ size: string; color: string }>) => {
      state.selectedSize = action.payload.size;
      state.selectedColor = action.payload.color;
    },
    closeTryOn: (state) => {
      state.activeProduct = null;
      state.scopedBrandSlug = null;
      state.phase = 'upload';
      state.notice = null;
    },
  },
});

export const tryOnActions = tryOnSlice.actions;
export default tryOnSlice.reducer;

