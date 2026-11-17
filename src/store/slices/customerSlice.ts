import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AppNotification,
  CustomerOrder,
  CustomerPreferences,
  ProductReview,
  SavedAddress,
  TryOnResultRecord,
} from '../../types';

export interface SavedCustomerPhoto {
  id: string;
  url: string;
  label: string;
  createdAt: string;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    type: 'collection',
    title: 'Eid Heritage Collection Live',
    message: 'Dhaka Loom House and Noor & Zari added handwoven muslin Panjabis and Jamdani sarees.',
    href: '/collections?collection=eid-collection',
    read: false,
    createdAt: '2026-11-11T09:00:00.000Z',
  },
  {
    id: 'notif_3',
    type: 'brand',
    title: 'Aura Atelier Added Boutique Exclusives',
    message: 'Explore studio-only cashmere outerwear exclusively on the Aura Atelier storefront.',
    href: '/brands/aura-atelier',
    read: true,
    createdAt: '2026-11-09T12:00:00.000Z',
  },
];

export interface CustomerSliceState {
  _hydrated: boolean;
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
}

export const PERSISTED_CUSTOMER_KEYS = [
  'wishlistIds',
  'followedBrandSlugs',
  'savedPhotos',
  'tryOnHistory',
  'orders',
  'addresses',
  'customReviews',
  'notifications',
  'recentSearches',
  'preferences',
  'announcementDismissed',
] as const;

export type PersistedCustomerSlice = Pick<CustomerSliceState, (typeof PERSISTED_CUSTOMER_KEYS)[number]>;

const initialState: CustomerSliceState = {
  _hydrated: false,
  wishlistIds: ['prod_aura_dress_01', 'prod_dlh_panjabi_01'],
  followedBrandSlugs: ['aura-atelier', 'dhaka-loom-house'],
  savedPhotos: [],
  tryOnHistory: [],
  orders: [],
  addresses: [
    {
      id: 'addr_default_1',
      label: 'Home',
      fullName: 'Nadia Rahman',
      phone: '+880 1711-000000',
      email: 'customer@example.com',
      street: 'House 24, Road 11, Banani',
      city: 'Dhaka',
      state: 'Dhaka',
      postalCode: '1213',
      country: 'Bangladesh',
      isDefault: true,
    },
  ],
  customReviews: [],
  notifications: INITIAL_NOTIFICATIONS,
  recentSearches: ['Silk Dress', 'Panjabi', 'Blazer'],
  preferences: {
    orderUpdates: true,
    brandDrops: true,
    tryOnAlerts: true,
    promoOffers: true,
    photoConsentGranted: false,
    autoDeletePhotosDays: 30,
  },
  announcementDismissed: false,
};

export const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    hydrateCustomer: (state, action: PayloadAction<Partial<PersistedCustomerSlice> | null>) => {
      const persisted = action.payload;
      if (persisted && typeof persisted === 'object') {
        for (const key of PERSISTED_CUSTOMER_KEYS) {
          if (persisted[key] !== undefined) {
            // @ts-expect-error key belongs to PERSISTED_CUSTOMER_KEYS
            state[key] = persisted[key];
          }
        }
      }
      state._hydrated = true;
    },
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      if (state.wishlistIds.includes(productId)) {
        state.wishlistIds = state.wishlistIds.filter((id) => id !== productId);
      } else {
        state.wishlistIds = [productId, ...state.wishlistIds];
      }
    },
    toggleFollowBrand: (state, action: PayloadAction<string>) => {
      const slug = action.payload;
      if (state.followedBrandSlugs.includes(slug)) {
        state.followedBrandSlugs = state.followedBrandSlugs.filter((s) => s !== slug);
      } else {
        state.followedBrandSlugs = [slug, ...state.followedBrandSlugs];
      }
    },
    addSavedPhotoRecord: (state, action: PayloadAction<SavedCustomerPhoto>) => {
      const record = action.payload;
      state.savedPhotos = [record, ...state.savedPhotos.filter((p) => p.url !== record.url)].slice(0, 8);
    },
    deleteSavedPhoto: (state, action: PayloadAction<string>) => {
      state.savedPhotos = state.savedPhotos.filter((p) => p.id !== action.payload);
    },
    clearAllSavedPhotos: (state) => {
      state.savedPhotos = [];
    },
    addTryOnRecord: (state, action: PayloadAction<TryOnResultRecord>) => {
      state.tryOnHistory = [action.payload, ...state.tryOnHistory].slice(0, 30);
    },
    deleteTryOnRecord: (state, action: PayloadAction<string>) => {
      state.tryOnHistory = state.tryOnHistory.filter((r) => r.id !== action.payload);
    },
    clearTryOnHistory: (state) => {
      state.tryOnHistory = [];
    },
    addOrder: (state, action: PayloadAction<CustomerOrder>) => {
      state.orders = [action.payload, ...state.orders];
    },
    cancelOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.map((o) =>
        o.id === action.payload && o.status === 'PROCESSING' ? { ...o, status: 'CANCELLED' } : o
      );
    },
    requestReturnOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.map((o) =>
        o.id === action.payload && o.status === 'DELIVERED'
          ? { ...o, status: 'RETURN_REQUESTED' }
          : o
      );
    },
    addAddress: (state, action: PayloadAction<Omit<SavedAddress, 'id'>>) => {
      const addr = action.payload;
      const id = `addr_${Date.now()}`;
      const base = addr.isDefault
        ? state.addresses.map((a) => ({ ...a, isDefault: false }))
        : state.addresses;
      state.addresses = [{ ...addr, id }, ...base];
    },
    removeAddress: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.filter((a) => a.id !== action.payload);
    },
    setDefaultAddress: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.map((a) => ({ ...a, isDefault: a.id === action.payload }));
    },
    addReview: (state, action: PayloadAction<ProductReview>) => {
      state.customReviews = [action.payload, ...state.customReviews];
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.map((n) =>
        n.id === action.payload ? { ...n, read: true } : n
      );
    },
    markAllNotificationsRead: (state) => {
      state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    pushNotification: (state, action: PayloadAction<Omit<AppNotification, 'id' | 'read' | 'createdAt'>>) => {
      state.notifications = [
        {
          ...action.payload,
          id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...state.notifications,
      ].slice(0, 30);
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const clean = action.payload.trim();
      if (!clean) return;
      state.recentSearches = [
        clean,
        ...state.recentSearches.filter((x) => x.toLowerCase() !== clean.toLowerCase()),
      ].slice(0, 6);
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
    updatePreferences: (state, action: PayloadAction<Partial<CustomerPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    dismissAnnouncement: (state) => {
      state.announcementDismissed = true;
    },
  },
});

export const customerActions = customerSlice.actions;
export default customerSlice.reducer;

