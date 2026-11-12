import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, MarketplaceProduct } from '../../types';

export interface CartSliceState {
  _hydrated: boolean;
  items: CartItem[];
  savedForLater: CartItem[];
  isOpen: boolean;
  checkoutStep: 'cart' | 'shipping' | 'confirmed';
  confirmedOrderId: string | null;
}

export const PERSISTED_CART_KEYS = ['items', 'savedForLater'] as const;
export type PersistedCartSlice = Pick<CartSliceState, (typeof PERSISTED_CART_KEYS)[number]>;

const initialState: CartSliceState = {
  _hydrated: false,
  items: [],
  savedForLater: [],
  isOpen: false,
  checkoutStep: 'cart',
  confirmedOrderId: null,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateCart: (state, action: PayloadAction<Partial<PersistedCartSlice> | null>) => {
      const persisted = action.payload;
      if (persisted && typeof persisted === 'object') {
        if (Array.isArray(persisted.items)) state.items = persisted.items;
        if (Array.isArray(persisted.savedForLater)) state.savedForLater = persisted.savedForLater;
      }
      state._hydrated = true;
    },
    addToCart: (
      state,
      action: PayloadAction<{
        product: MarketplaceProduct;
        size?: string;
        color?: string;
        quantity?: number;
      }>
    ) => {
      const { product, size, color, quantity = 1 } = action.payload;
      const resolvedSize = size || product.sizes?.[0] || 'M';
      const resolvedColor = color || product.colors?.[0]?.name || 'Classic';
      const matchedVariant =
        product.variants?.find(
          (v) => v.size === resolvedSize && v.color.toLowerCase() === resolvedColor.toLowerCase()
        ) || product.variants?.[0];

      const existingIdx = state.items.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.size === resolvedSize &&
          (item.color || 'Classic') === resolvedColor
      );

      if (existingIdx !== -1) {
        state.items[existingIdx].quantity += quantity;
      } else {
        state.items.push({
          id: `${product.id}_${resolvedSize}_${resolvedColor}`,
          product,
          size: resolvedSize,
          color: resolvedColor,
          variantSku: matchedVariant?.sku,
          quantity,
        });
      }
      state.isOpen = true;
      state.checkoutStep = 'cart';
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((_, idx) => idx !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ index: number; quantity: number }>) => {
      const { index, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((_, idx) => idx !== index);
      } else {
        state.items = state.items.map((item, idx) =>
          idx === index ? { ...item, quantity: Math.min(20, quantity) } : item
        );
      }
    },
    saveForLater: (state, action: PayloadAction<number>) => {
      const target = state.items[action.payload];
      if (!target) return;
      state.items = state.items.filter((_, idx) => idx !== action.payload);
      state.savedForLater = [
        target,
        ...state.savedForLater.filter(
          (s) => !(s.product.id === target.product.id && s.size === target.size)
        ),
      ];
    },
    moveToCartFromSaved: (state, action: PayloadAction<number>) => {
      const target = state.savedForLater[action.payload];
      if (!target) return;
      state.savedForLater = state.savedForLater.filter((_, idx) => idx !== action.payload);
      state.items.push(target);
    },
    removeSavedForLater: (state, action: PayloadAction<number>) => {
      state.savedForLater = state.savedForLater.filter((_, idx) => idx !== action.payload);
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
    setCheckoutStep: (state, action: PayloadAction<'cart' | 'shipping' | 'confirmed'>) => {
      state.checkoutStep = action.payload;
    },
    confirmOrder: (state, action: PayloadAction<string>) => {
      state.confirmedOrderId = action.payload;
      state.checkoutStep = 'confirmed';
      state.items = [];
    },
    clearCart: (state) => {
      state.items = [];
    },
    resetCart: (state) => {
      state.items = [];
      state.checkoutStep = 'cart';
      state.confirmedOrderId = null;
    },
  },
});

export const cartActions = cartSlice.actions;
export default cartSlice.reducer;

