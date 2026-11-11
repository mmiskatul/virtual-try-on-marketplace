import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  AppNotification,
  CustomerOrder,
  CustomerPreferences,
  ProductReview,
  SavedAddress,
  TryOnResultRecord,
} from '../types';

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
    createdAt: new Date(Date.now() - 3600_000 * 3).toISOString(),
  },
  {
    id: 'notif_2',
    type: 'discount',
    title: '10% Welcome Code Active: VTRY10',
    message: 'Apply code VTRY10 at checkout across participating brands or enjoy free shipping over $150.',
    href: '/discover?onSale=true',
    read: false,
    createdAt: new Date(Date.now() - 3600_000 * 14).toISOString(),
  },
  {
    id: 'notif_3',
    type: 'brand',
    title: 'Aura Atelier Added Boutique Exclusives',
    message: 'Explore studio-only cashmere outerwear exclusively on the Aura Atelier storefront.',
    href: '/brands/aura-atelier',
    read: true,
    createdAt: new Date(Date.now() - 86400_000 * 2).toISOString(),
  },
];

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

export const useMarketplaceStore = create<MarketplaceCustomerStore>()(
  persist(
    (set, get) => ({
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

      toggleWishlist: (productId) =>
        set((state) => {
          const exists = state.wishlistIds.includes(productId);
          return {
            wishlistIds: exists
              ? state.wishlistIds.filter((id) => id !== productId)
              : [productId, ...state.wishlistIds],
          };
        }),

      isWishlisted: (productId) => get().wishlistIds.includes(productId),

      toggleFollowBrand: (brandSlug) =>
        set((state) => {
          const exists = state.followedBrandSlugs.includes(brandSlug);
          return {
            followedBrandSlugs: exists
              ? state.followedBrandSlugs.filter((s) => s !== brandSlug)
              : [brandSlug, ...state.followedBrandSlugs],
          };
        }),

      isFollowingBrand: (brandSlug) => get().followedBrandSlugs.includes(brandSlug),

      addSavedPhoto: ({ url, label }) => {
        const record: SavedCustomerPhoto = {
          id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          url,
          label: label || `Saved Photo ${get().savedPhotos.length + 1}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          savedPhotos: [record, ...state.savedPhotos.filter((p) => p.url !== url)].slice(0, 8),
        }));
        return record;
      },

      deleteSavedPhoto: (id) =>
        set((state) => ({
          savedPhotos: state.savedPhotos.filter((p) => p.id !== id),
        })),

      clearAllSavedPhotos: () => set({ savedPhotos: [] }),

      addTryOnRecord: (record) =>
        set((state) => ({
          tryOnHistory: [record, ...state.tryOnHistory].slice(0, 30),
        })),

      deleteTryOnRecord: (id) =>
        set((state) => ({
          tryOnHistory: state.tryOnHistory.filter((r) => r.id !== id),
        })),

      clearTryOnHistory: () => set({ tryOnHistory: [] }),

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),

      cancelOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId && o.status === 'PROCESSING' ? { ...o, status: 'CANCELLED' } : o
          ),
        })),

      requestReturnOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId && o.status === 'DELIVERED'
              ? { ...o, status: 'RETURN_REQUESTED' }
              : o
          ),
        })),

      addAddress: (addr) =>
        set((state) => {
          const id = `addr_${Date.now()}`;
          const nextAddresses = addr.isDefault
            ? state.addresses.map((a) => ({ ...a, isDefault: false }))
            : state.addresses;
          return {
            addresses: [{ ...addr, id }, ...nextAddresses],
          };
        }),

      removeAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
        })),

      setDefaultAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
        })),

      addReview: (review) =>
        set((state) => ({
          customReviews: [review, ...state.customReviews],
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      clearNotifications: () => set({ notifications: [] }),

      pushNotification: (n) =>
        set((state) => ({
          notifications: [
            {
              ...n,
              id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ].slice(0, 30),
        })),

      addRecentSearch: (q) =>
        set((state) => {
          const clean = q.trim();
          if (!clean) return state;
          return {
            recentSearches: [
              clean,
              ...state.recentSearches.filter((x) => x.toLowerCase() !== clean.toLowerCase()),
            ].slice(0, 6),
          };
        }),

      clearRecentSearches: () => set({ recentSearches: [] }),

      updatePreferences: (partial) =>
        set((state) => ({
          preferences: { ...state.preferences, ...partial },
        })),

      dismissAnnouncement: () => set({ announcementDismissed: true }),
    }),
    {
      name: 'vton_marketplace_customer_state',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

