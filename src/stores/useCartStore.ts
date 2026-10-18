import { create } from 'zustand';
import { CartItem, MarketplaceProduct } from '../types';
import { INITIAL_PRODUCTS } from '../lib/mock_data';

export interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  checkoutStep: 'cart' | 'shipping' | 'confirmed';
  confirmedOrderId: string | null;

  // Actions
  addToCart: (product: MarketplaceProduct, size?: string) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  openCart: () => void;
  closeCart: () => void;
  setCheckoutStep: (step: 'cart' | 'shipping' | 'confirmed') => void;
  confirmOrder: (orderId: string) => void;
  resetCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [
    {
      product: INITIAL_PRODUCTS[0],
      size: 'M',
      quantity: 1
    }
  ],
  isOpen: false,
  checkoutStep: 'cart',
  confirmedOrderId: null,

  addToCart: (product, size = 'M') =>
    set((state) => {
      const existing = state.items.find(
        (item) => item.product.id === product.id && item.size === size
      );
      if (existing) {
        return {
          items: state.items.map((item) =>
            item === existing ? { ...item, quantity: item.quantity + 1 } : item
          ),
          isOpen: true
        };
      }
      return {
        items: [...state.items, { product, size, quantity: 1 }],
        isOpen: true
      };
    }),

  removeFromCart: (index) =>
    set((state) => ({
      items: state.items.filter((_, idx) => idx !== index)
    })),

  updateQuantity: (index, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((_, idx) => idx !== index) };
      }
      return {
        items: state.items.map((item, idx) =>
          idx === index ? { ...item, quantity } : item
        )
      };
    }),

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  setCheckoutStep: (checkoutStep) => set({ checkoutStep }),
  confirmOrder: (confirmedOrderId) =>
    set({
      confirmedOrderId,
      checkoutStep: 'confirmed',
      items: []
    }),
  resetCart: () =>
    set({
      items: [],
      checkoutStep: 'cart',
      confirmedOrderId: null
    })
}));
