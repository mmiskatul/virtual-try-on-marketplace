import {
  AppNotification,
  CustomerOrder,
  CustomerPreferences,
  ProductReview,
  SavedAddress,
  TryOnResultRecord,
} from '../types';
import { store } from '../store';
import { createSliceFacadeHook } from '../store/hooks';
import { selectCustomerState } from '../store/selectors';
import { customerActions, SavedCustomerPhoto } from '../store/slices/customerSlice';

export type { SavedCustomerPhoto };

export interface MarketplaceCustomerStore {
  wishlistIds: string[];
  followedBrandSlugs: string[];
  savedPhotos: SavedCustomerPhoto[];
  tryOnHistory: TryOnResultRecord[];
  orders: CustomerOrder[];
  addresses: SavedAddress[];
  customReviews: ProductReview[];
  notifications: AppNotification[];
  recentSearches: string[];
  preferences: CustomerPreferences;
  announcementDismissed: boolean;

  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  toggleFollowBrand: (brandSlug: string) => void;
  isFollowingBrand: (brandSlug: string) => boolean;

  addSavedPhoto: (photo: { url: string; label?: string }) => SavedCustomerPhoto;
  deleteSavedPhoto: (id: string) => void;
  clearAllSavedPhotos: () => void;

  addTryOnRecord: (record: TryOnResultRecord) => void;
  deleteTryOnRecord: (id: string) => void;
  clearTryOnHistory: () => void;

  addOrder: (order: CustomerOrder) => void;
  cancelOrder: (orderId: string) => void;
  requestReturnOrder: (orderId: string) => void;

  addAddress: (addr: Omit<SavedAddress, 'id'>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  addReview: (review: ProductReview) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  pushNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;

  addRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;

  updatePreferences: (partial: Partial<CustomerPreferences>) => void;
  dismissAnnouncement: () => void;
}

const customerBoundActions = {
  toggleWishlist: (productId: string) => {
    store.dispatch(customerActions.toggleWishlist(productId));
  },
  isWishlisted: (productId: string) =>
    store.getState().customer.wishlistIds.includes(productId),
  toggleFollowBrand: (brandSlug: string) => {
    store.dispatch(customerActions.toggleFollowBrand(brandSlug));
  },
  isFollowingBrand: (brandSlug: string) =>
    store.getState().customer.followedBrandSlugs.includes(brandSlug),

  addSavedPhoto: ({ url, label }: { url: string; label?: string }): SavedCustomerPhoto => {
    const record: SavedCustomerPhoto = {
      id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      url,
      label: label || `Saved Photo ${store.getState().customer.savedPhotos.length + 1}`,
      createdAt: new Date().toISOString(),
    };
    store.dispatch(customerActions.addSavedPhotoRecord(record));
    return record;
  },
  deleteSavedPhoto: (id: string) => {
    store.dispatch(customerActions.deleteSavedPhoto(id));
  },
  clearAllSavedPhotos: () => {
    store.dispatch(customerActions.clearAllSavedPhotos());
  },

  addTryOnRecord: (record: TryOnResultRecord) => {
    store.dispatch(customerActions.addTryOnRecord(record));
  },
  deleteTryOnRecord: (id: string) => {
    store.dispatch(customerActions.deleteTryOnRecord(id));
  },
  clearTryOnHistory: () => {
    store.dispatch(customerActions.clearTryOnHistory());
  },

  addOrder: (order: CustomerOrder) => {
    store.dispatch(customerActions.addOrder(order));
  },
  cancelOrder: (orderId: string) => {
    store.dispatch(customerActions.cancelOrder(orderId));
  },
  requestReturnOrder: (orderId: string) => {
    store.dispatch(customerActions.requestReturnOrder(orderId));
  },

  addAddress: (addr: Omit<SavedAddress, 'id'>) => {
    store.dispatch(customerActions.addAddress(addr));
  },
  removeAddress: (id: string) => {
    store.dispatch(customerActions.removeAddress(id));
  },
  setDefaultAddress: (id: string) => {
    store.dispatch(customerActions.setDefaultAddress(id));
  },

  addReview: (review: ProductReview) => {
    store.dispatch(customerActions.addReview(review));
  },

  markNotificationRead: (id: string) => {
    store.dispatch(customerActions.markNotificationRead(id));
  },
  markAllNotificationsRead: () => {
    store.dispatch(customerActions.markAllNotificationsRead());
  },
  clearNotifications: () => {
    store.dispatch(customerActions.clearNotifications());
  },
  pushNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => {
    store.dispatch(customerActions.pushNotification(n));
  },

  addRecentSearch: (q: string) => {
    store.dispatch(customerActions.addRecentSearch(q));
  },
  clearRecentSearches: () => {
    store.dispatch(customerActions.clearRecentSearches());
  },

  updatePreferences: (partial: Partial<CustomerPreferences>) => {
    store.dispatch(customerActions.updatePreferences(partial));
  },
  dismissAnnouncement: () => {
    store.dispatch(customerActions.dismissAnnouncement());
  },
};

export const useMarketplaceStore = createSliceFacadeHook(selectCustomerState, customerBoundActions);
