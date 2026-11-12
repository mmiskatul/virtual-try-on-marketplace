import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
  CartSliceState,
  PERSISTED_CART_KEYS,
  PersistedCartSlice,
} from '../slices/cartSlice';
import {
  CustomerSliceState,
  PERSISTED_CUSTOMER_KEYS,
  PersistedCustomerSlice,
} from '../slices/customerSlice';

export const CART_STORAGE_KEY = 'vton_marketplace_cart';
export const CUSTOMER_STORAGE_KEY = 'vton_marketplace_customer_state';

function readPersistedSlice<T>(storageKey: string): Partial<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const candidate = parsed && typeof parsed === 'object' && 'state' in parsed ? parsed.state : parsed;
    if (!candidate || typeof candidate !== 'object') return null;
    return candidate as Partial<T>;
  } catch {
    return null;
  }
}

export const readPersistedCartState = () => readPersistedSlice<PersistedCartSlice>(CART_STORAGE_KEY);
export const readPersistedCustomerState = () =>
  readPersistedSlice<PersistedCustomerSlice>(CUSTOMER_STORAGE_KEY);

export const marketplacePersistenceMiddleware = createListenerMiddleware();

marketplacePersistenceMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    if (typeof window === 'undefined') return false;
    if (!action.type.startsWith('cart/') || action.type === 'cart/hydrateCart') return false;
    const curr = (currentState as { cart: CartSliceState }).cart;
    const prev = (previousState as { cart: CartSliceState }).cart;
    if (!curr._hydrated || curr === prev) return false;
    return PERSISTED_CART_KEYS.some((key) => curr[key] !== prev[key]);
  },
  effect: (_action, listenerApi) => {
    try {
      const cart = (listenerApi.getState() as { cart: CartSliceState }).cart;
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          state: { items: cart.items, savedForLater: cart.savedForLater },
          version: 0,
        })
      );
    } catch {
      // ignore quota/private mode error
    }
  },
});

marketplacePersistenceMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    if (typeof window === 'undefined') return false;
    if (!action.type.startsWith('customer/') || action.type === 'customer/hydrateCustomer') return false;
    const curr = (currentState as { customer: CustomerSliceState }).customer;
    const prev = (previousState as { customer: CustomerSliceState }).customer;
    if (!curr._hydrated || curr === prev) return false;
    return PERSISTED_CUSTOMER_KEYS.some((key) => curr[key] !== prev[key]);
  },
  effect: (_action, listenerApi) => {
    try {
      const customer = (listenerApi.getState() as { customer: CustomerSliceState }).customer;
      const persisted = {} as PersistedCustomerSlice;
      for (const key of PERSISTED_CUSTOMER_KEYS) {
        // @ts-expect-error key belongs to PERSISTED_CUSTOMER_KEYS
        persisted[key] = customer[key];
      }
      window.localStorage.setItem(
        CUSTOMER_STORAGE_KEY,
        JSON.stringify({ state: persisted, version: 0 })
      );
    } catch {
      // ignore quota/private mode error
    }
  },
});

