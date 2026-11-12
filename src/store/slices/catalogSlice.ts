import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BrandPartner, MarketplaceProduct } from '../../types';
import { INITIAL_BRANDS, INITIAL_PRODUCTS } from '../../lib/mock_data';

export interface CatalogSliceState {
  products: MarketplaceProduct[];
  brands: BrandPartner[];
  searchQuery: string;
  selectedCategory: string;
  selectedBrand: string;
  tryOnOnly: boolean;
  sortBy: 'newest' | 'price-asc' | 'price-desc';
}

const initialState: CatalogSliceState = {
  products: INITIAL_PRODUCTS,
  brands: INITIAL_BRANDS,
  searchQuery: '',
  selectedCategory: 'All',
  selectedBrand: 'All',
  tryOnOnly: false,
  sortBy: 'newest',
};

export const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<MarketplaceProduct[]>) => {
      state.products = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSelectedBrand: (state, action: PayloadAction<string>) => {
      state.selectedBrand = action.payload;
    },
    toggleTryOnOnly: (state) => {
      state.tryOnOnly = !state.tryOnOnly;
    },
    setTryOnOnly: (state, action: PayloadAction<boolean>) => {
      state.tryOnOnly = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'newest' | 'price-asc' | 'price-desc'>) => {
      state.sortBy = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.selectedCategory = 'All';
      state.selectedBrand = 'All';
      state.tryOnOnly = false;
      state.sortBy = 'newest';
    },
  },
});

export const catalogActions = catalogSlice.actions;
export default catalogSlice.reducer;

