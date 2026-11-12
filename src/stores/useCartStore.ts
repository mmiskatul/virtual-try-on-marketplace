import { CartItem, MarketplaceProduct } from '../types';
import { store } from '../store';
import { createSliceFacadeHook } from '../store/hooks';
import { selectCartState } from '../store/selectors';
import { cartActions } from '../store/slices/cartSlice';

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

const cartBoundActions = {
  addToCart: (product: MarketplaceProduct, size?: string, color?: string, quantity?: number) => {
    store.dispatch(cartActions.addToCart({ product, size, color, quantity }));
  },
  removeFromCart: (index: number) => {
    store.dispatch(cartActions.removeFromCart(index));
  },
  updateQuantity: (index: number, quantity: number) => {
    store.dispatch(cartActions.updateQuantity({ index, quantity }));
  },
  saveForLater: (index: number) => {
    store.dispatch(cartActions.saveForLater(index));
  },
  moveToCartFromSaved: (index: number) => {
    store.dispatch(cartActions.moveToCartFromSaved(index));
  },
  removeSavedForLater: (index: number) => {
    store.dispatch(cartActions.removeSavedForLater(index));
  },
  openCart: () => {
    store.dispatch(cartActions.openCart());
  },
  closeCart: () => {
    store.dispatch(cartActions.closeCart());
  },
  setCheckoutStep: (step: 'cart' | 'shipping' | 'confirmed') => {
    store.dispatch(cartActions.setCheckoutStep(step));
  },
  confirmOrder: (orderId: string) => {
    store.dispatch(cartActions.confirmOrder(orderId));
  },
  clearCart: () => {
    store.dispatch(cartActions.clearCart());
  },
  resetCart: () => {
    store.dispatch(cartActions.resetCart());
  },
};

export const useCartStore = createSliceFacadeHook(selectCartState, cartBoundActions);
