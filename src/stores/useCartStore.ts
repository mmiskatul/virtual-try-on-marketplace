import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CartItem, MarketplaceProduct } from '../types';

export interface CartStore {
  items: CartItem[];
  savedForLater: CartItem[];
  isOpen: boolean;
  checkoutStep: 'cart' | 'shipping' | 'confirmed';
  confirmedOrderId: string | null;

  addToCart: (product: MarketplaceProduct, size?: string, color?: string, quantity?: number) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  saveForLater: (index: number) => void;
  moveToCartFromSaved: (index: number) => void;
  removeSavedForLater: (index: number) => void;
  openCart: () => void;
  closeCart: () => void;
  setCheckoutStep: (step: 'cart' | 'shipping' | 'confirmed') => void;
  confirmOrder: (orderId: string) => void;
  clearCart: () => void;
  resetCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      savedForLater: [],
      isOpen: false,
      checkoutStep: 'cart',
      confirmedOrderId: null,

      addToCart: (product, size, color, quantity = 1) =>
        set((state) => {
          const resolvedSize = size || product.sizes?.[0] || 'M';
          const resolvedColor = color || product.colors?.[0]?.name || 'Classic';
          const matchedVariant = product.variants?.find(
            (v) => v.size === resolvedSize && v.color.toLowerCase() === resolvedColor.toLowerCase()
          ) || product.variants?.[0];

          const existingIdx = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.size === resolvedSize &&
              (item.color || 'Classic') === resolvedColor
          );

          if (existingIdx !== -1) {
            return {
              items: state.items.map((item, idx) =>
                idx === existingIdx ? { ...item, quantity: item.quantity + quantity } : item
              ),
              isOpen: true,
              checkoutStep: 'cart',
            };
          }

          return {
            items: [
              ...state.items,
              {
                id: `${product.id}_${resolvedSize}_${resolvedColor}`,
                product,
                size: resolvedSize,
                color: resolvedColor,
                variantSku: matchedVariant?.sku,
                quantity,
              },
            ],
            isOpen: true,
            checkoutStep: 'cart',
          };
        }),

      removeFromCart: (index) =>
        set((state) => ({
          items: state.items.filter((_, idx) => idx !== index),
        })),

      updateQuantity: (index, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((_, idx) => idx !== index) };
          }
          return {
            items: state.items.map((item, idx) =>
              idx === index ? { ...item, quantity: Math.min(20, quantity) } : item
            ),
          };
        }),

      saveForLater: (index) =>
        set((state) => {
          const target = state.items[index];
          if (!target) return state;
          return {
            items: state.items.filter((_, idx) => idx !== index),
            savedForLater: [
              target,
              ...state.savedForLater.filter(
                (s) => !(s.product.id === target.product.id && s.size === target.size)
              ),
            ],
          };
        }),

      moveToCartFromSaved: (index) =>
        set((state) => {
          const target = state.savedForLater[index];
          if (!target) return state;
          return {
            savedForLater: state.savedForLater.filter((_, idx) => idx !== index),
            items: [...state.items, target],
          };
        }),

      removeSavedForLater: (index) =>
        set((state) => ({
          savedForLater: state.savedForLater.filter((_, idx) => idx !== index),
        })),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setCheckoutStep: (checkoutStep) => set({ checkoutStep }),
      confirmOrder: (confirmedOrderId) =>
        set({
          confirmedOrderId,
          checkoutStep: 'confirmed',
          items: [],
        }),
      clearCart: () => set({ items: [] }),
      resetCart: () =>
        set({
          items: [],
          checkoutStep: 'cart',
          confirmedOrderId: null,
        }),
    }),
    {
      name: 'vton_marketplace_cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        savedForLater: state.savedForLater,
      }),
    }
  )
);
