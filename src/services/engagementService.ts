import { MARKETPLACE_API_URL, marketplaceFetch } from '@/lib/api';

const API_BASE = MARKETPLACE_API_URL;

export const engagementService = {
  // Cart
  getServerCart: async () => {
    const res = await marketplaceFetch(`${API_BASE}/api/v1/cart`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json;
  },

  addServerCartItem: async (productId: string, sku?: string, quantity = 1) => {
    const res = await marketplaceFetch(`${API_BASE}/api/v1/cart/items`, {
      method: 'POST',
      body: JSON.stringify({ productId, sku, quantity }),
    });
    return res.json();
  },

  removeServerCartItem: async (sku: string) => {
    const res = await marketplaceFetch(`${API_BASE}/api/v1/cart/items/${encodeURIComponent(sku)}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Orders
  getMyOrders: async () => {
    const res = await marketplaceFetch(`${API_BASE}/api/v1/orders`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.orders || [];
  },

  // Favorites
  getFavorites: async (): Promise<string[]> => {
    const res = await marketplaceFetch(`${API_BASE}/api/v1/favorites`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.productIds || [];
  },

  addFavorite: async (productId: string) => {
    const res = await marketplaceFetch(`${API_BASE}/api/v1/favorites`, {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
    return res.json();
  },

  removeFavorite: async (productId: string) => {
    const res = await marketplaceFetch(`${API_BASE}/api/v1/favorites/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Reviews
  getProductReviews: async (productId: string) => {
    const res = await marketplaceFetch(`${API_BASE}/api/v1/products/${encodeURIComponent(productId)}/reviews`, {
      cache: 'no-store',
    });
    if (!res.ok) return { reviews: [], averageRating: 0, totalCount: 0 };
    const json = await res.json();
    return json?.data || { reviews: [], averageRating: 0, totalCount: 0 };
  },

  submitReview: async (productId: string, rating: number, comment: string) => {
    const res = await marketplaceFetch(`${API_BASE}/api/v1/products/${encodeURIComponent(productId)}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
    return res.json();
  },

  // Notifications, Support & Privacy Export
  getNotifications: async () => {
    const res = await marketplaceFetch(`${API_BASE}/api/v1/notifications`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.notifications || [];
  },

  submitSupportTicket: async (payload: {
    subject: string;
    category?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    message: string;
  }) => {
    const res = await marketplaceFetch(`${API_BASE}/api/v1/support/tickets`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  exportAccountData: async () => {
    const res = await marketplaceFetch(`${API_BASE}/api/v1/account/export`, { cache: 'no-store' });
    return res.json();
  },

  requestAccountDeletion: async () => {
    const res = await marketplaceFetch(`${API_BASE}/api/v1/account/delete-request`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return res.json();
  },
};

