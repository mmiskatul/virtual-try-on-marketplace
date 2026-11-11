const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:4000';

function customerHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('marketplace_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const engagementService = {
  // Cart
  getServerCart: async () => {
    const res = await fetch(`${API_BASE}/api/v1/cart`, { headers: customerHeaders(), cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json;
  },

  addServerCartItem: async (productId: string, sku?: string, quantity = 1) => {
    const res = await fetch(`${API_BASE}/api/v1/cart/items`, {
      method: 'POST',
      headers: customerHeaders(),
      body: JSON.stringify({ productId, sku, quantity }),
    });
    return res.json();
  },

  removeServerCartItem: async (sku: string) => {
    const res = await fetch(`${API_BASE}/api/v1/cart/items/${encodeURIComponent(sku)}`, {
      method: 'DELETE',
      headers: customerHeaders(),
    });
    return res.json();
  },

  // Orders
  getMyOrders: async () => {
    const res = await fetch(`${API_BASE}/api/v1/orders`, { headers: customerHeaders(), cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.orders || [];
  },

  // Favorites
  getFavorites: async (): Promise<string[]> => {
    const res = await fetch(`${API_BASE}/api/v1/favorites`, { headers: customerHeaders(), cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.productIds || [];
  },

  addFavorite: async (productId: string) => {
    const res = await fetch(`${API_BASE}/api/v1/favorites`, {
      method: 'POST',
      headers: customerHeaders(),
      body: JSON.stringify({ productId }),
    });
    return res.json();
  },

  removeFavorite: async (productId: string) => {
    const res = await fetch(`${API_BASE}/api/v1/favorites/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
      headers: customerHeaders(),
    });
    return res.json();
  },

  // Reviews
  getProductReviews: async (productId: string) => {
    const res = await fetch(`${API_BASE}/api/v1/products/${encodeURIComponent(productId)}/reviews`, { cache: 'no-store' });
    if (!res.ok) return { reviews: [], averageRating: 0, totalCount: 0 };
    const json = await res.json();
    return json?.data || { reviews: [], averageRating: 0, totalCount: 0 };
  },

  submitReview: async (productId: string, rating: number, comment: string) => {
    const res = await fetch(`${API_BASE}/api/v1/products/${encodeURIComponent(productId)}/reviews`, {
      method: 'POST',
      headers: customerHeaders(),
      body: JSON.stringify({ rating, comment }),
    });
    return res.json();
  },

  // Notifications, Support & Privacy Export
  getNotifications: async () => {
    const res = await fetch(`${API_BASE}/api/v1/notifications`, { headers: customerHeaders(), cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.notifications || [];
  },

  submitSupportTicket: async (payload: { subject: string; category?: string; priority?: 'LOW' | 'MEDIUM' | 'HIGH'; message: string }) => {
    const res = await fetch(`${API_BASE}/api/v1/support/tickets`, {
      method: 'POST',
      headers: customerHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  exportAccountData: async () => {
    const res = await fetch(`${API_BASE}/api/v1/account/export`, { headers: customerHeaders(), cache: 'no-store' });
    return res.json();
  },

  requestAccountDeletion: async () => {
    const res = await fetch(`${API_BASE}/api/v1/account/delete-request`, {
      method: 'POST',
      headers: customerHeaders(),
      body: JSON.stringify({}),
    });
    return res.json();
  },
};

