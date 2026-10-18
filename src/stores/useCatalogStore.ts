import { create } from 'zustand';
import { MarketplaceProduct, BrandPartner } from '../types';
import { INITIAL_PRODUCTS, INITIAL_BRANDS } from '../lib/mock_data';

export interface CatalogStore {
  products: MarketplaceProduct[];
  brands: BrandPartner[];
  searchQuery: string;
  selectedCategory: string;
  selectedBrand: string;
  tryOnOnly: boolean;
  sortBy: 'newest' | 'price-asc' | 'price-desc';

  // Actions
  setProducts: (products: MarketplaceProduct[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedBrand: (brand: string) => void;
  toggleTryOnOnly: () => void;
  setTryOnOnly: (val: boolean) => void;
  setSortBy: (sort: 'newest' | 'price-asc' | 'price-desc') => void;
  resetFilters: () => void;
}

export const useCatalogStore = create<CatalogStore>((set) => ({
  products: INITIAL_PRODUCTS,
  brands: INITIAL_BRANDS,
  searchQuery: '',
  selectedCategory: 'All',
  selectedBrand: 'All',
  tryOnOnly: false,
  sortBy: 'newest',

  setProducts: (products) => set({ products }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSelectedBrand: (selectedBrand) => set({ selectedBrand }),
  toggleTryOnOnly: () => set((state) => ({ tryOnOnly: !state.tryOnOnly })),
  setTryOnOnly: (tryOnOnly) => set({ tryOnOnly }),
  setSortBy: (sortBy) => set({ sortBy }),
  resetFilters: () =>
    set({
      searchQuery: '',
      selectedCategory: 'All',
      selectedBrand: 'All',
      tryOnOnly: false,
      sortBy: 'newest'
    })
}));
