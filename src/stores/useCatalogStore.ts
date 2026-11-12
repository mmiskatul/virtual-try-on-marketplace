import { MarketplaceProduct, BrandPartner } from '../types';
import { store } from '../store';
import { createSliceFacadeHook } from '../store/hooks';
import { selectCatalogState } from '../store/selectors';
import { catalogActions } from '../store/slices/catalogSlice';

export interface CatalogStore {
  products: MarketplaceProduct[];
  brands: BrandPartner[];
  searchQuery: string;
  selectedCategory: string;
  selectedBrand: string;
  tryOnOnly: boolean;
  sortBy: 'newest' | 'price-asc' | 'price-desc';

  setProducts: (products: MarketplaceProduct[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedBrand: (brand: string) => void;
  toggleTryOnOnly: () => void;
  setTryOnOnly: (val: boolean) => void;
  setSortBy: (sort: 'newest' | 'price-asc' | 'price-desc') => void;
  resetFilters: () => void;
}

const catalogBoundActions = {
  setProducts: (products: MarketplaceProduct[]) => {
    store.dispatch(catalogActions.setProducts(products));
  },
  setSearchQuery: (query: string) => {
    store.dispatch(catalogActions.setSearchQuery(query));
  },
  setSelectedCategory: (category: string) => {
    store.dispatch(catalogActions.setSelectedCategory(category));
  },
  setSelectedBrand: (brand: string) => {
    store.dispatch(catalogActions.setSelectedBrand(brand));
  },
  toggleTryOnOnly: () => {
    store.dispatch(catalogActions.toggleTryOnOnly());
  },
  setTryOnOnly: (val: boolean) => {
    store.dispatch(catalogActions.setTryOnOnly(val));
  },
  setSortBy: (sort: 'newest' | 'price-asc' | 'price-desc') => {
    store.dispatch(catalogActions.setSortBy(sort));
  },
  resetFilters: () => {
    store.dispatch(catalogActions.resetFilters());
  },
};

export const useCatalogStore = createSliceFacadeHook(selectCatalogState, catalogBoundActions);
