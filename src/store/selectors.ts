import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { lineUnitPrice } from '../lib/pricing';

export const selectCartState = (state: RootState) => state.cart;
export const selectCustomerState = (state: RootState) => state.customer;
export const selectCatalogState = (state: RootState) => state.catalog;
export const selectTryOnState = (state: RootState) => state.tryOn;

export const selectCartItemCount = createSelector(
  [(state: RootState) => state.cart.items],
  (items) => items.reduce((sum, item) => sum + item.quantity, 0)
);

export const selectCartSubtotal = createSelector(
  [(state: RootState) => state.cart.items],
  (items) => items.reduce((sum, item) => sum + lineUnitPrice(item) * item.quantity, 0)
);

export const selectUnreadNotificationCount = createSelector(
  [(state: RootState) => state.customer.notifications],
  (notifications) => notifications.filter((n) => !n.read).length
);

export const selectFilteredCatalogProducts = createSelector(
  [selectCatalogState],
  ({ products, searchQuery, selectedCategory, selectedBrand, tryOnOnly, sortBy }) => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (selectedBrand !== 'All' && p.brandSlug !== selectedBrand && p.brandName !== selectedBrand) {
        return false;
      }
      if (tryOnOnly && !p.isTryOnEligible) return false;
      if (
        query &&
        !p.name.toLowerCase().includes(query) &&
        !p.brandName.toLowerCase().includes(query) &&
        !p.category.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      return [...filtered].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...filtered].sort((a, b) => b.price - a.price);
    }
    return filtered;
  }
);

