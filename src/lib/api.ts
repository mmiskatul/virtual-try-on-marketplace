/**
 * Production API Client for Central Fashion Marketplace
 * Uses HttpOnly cookies (`vtry_mkt_access`, `vtry_mkt_refresh`, `vtry_mkt_sid`) + single-flight refresh.
 */

export const MARKETPLACE_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

let refreshInFlight: Promise<boolean> | null = null;

function isBackendUrl(url: string): boolean {
  return url.startsWith(MARKETPLACE_API_URL) || url.startsWith('/');
}

function shouldAttemptRefresh(url: string): boolean {
  const lower = url.toLowerCase();
  return !(
    lower.includes('/auth/login') ||
    lower.includes('/auth/register') ||
    lower.includes('/auth/refresh') ||
    lower.includes('/auth/logout') ||
    lower.includes('/auth/oauth-google') ||
    lower.includes('/auth/oauth-exchange')
  );
}

export async function refreshMarketplaceSession(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${MARKETPLACE_API_URL}/api/v1/marketplace/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-Auth-Portal': 'marketplace',
          'X-Auth-Transport': 'cookie',
        },
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function marketplaceFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const backendCall = isBackendUrl(url);
  if (backendCall) {
    headers.set('X-Auth-Portal', 'marketplace');
    headers.set('X-Auth-Transport', 'cookie');
  }

  const doFetch = () =>
    fetch(url, {
      ...options,
      headers,
      credentials: backendCall ? 'include' : options.credentials,
    });

  let response = await doFetch();
  if (response.status === 401 && backendCall && shouldAttemptRefresh(url)) {
    const refreshed = await refreshMarketplaceSession();
    if (refreshed) {
      response = await doFetch();
    }
  }
  return response;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await marketplaceFetch(url, options);

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    throw new ApiError(response.status, errorData?.message || `HTTP ${response.status}`, errorData);
  }

  return response.json();
}

export const marketplaceApi = {
  // Authentication & Account Recovery
  auth: {
    checkEmail: (email: string) => {
      return request<{
        exists: boolean;
        portalMismatch?: boolean;
        email: string;
        name?: string;
        emailVerified?: boolean;
        message?: string;
      }>(`${MARKETPLACE_API_URL}/api/v1/marketplace/auth/check-email`, {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    },

    register: (payload: { name: string; email: string; password: string }) => {
      return request<{
        message: string;
        requiresEmailVerification: boolean;
        emailDelivered?: boolean;
        warning?: string;
        user: { id: string; name: string; email: string; role: string; emailVerified: boolean };
      }>(`${MARKETPLACE_API_URL}/api/v1/marketplace/auth/register`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },

    login: (payload: { email: string; password: string }) => {
      return request<{
        message: string;
        sessionId?: string;
        session?: { id: string; portal: string; expiresAt: string; accessExpiresAt: string };
        user: { id: string; name: string; email: string; role: string; emailVerified: boolean };
      }>(`${MARKETPLACE_API_URL}/api/v1/marketplace/auth/login`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },

    session: () => {
      return request<{
        authenticated: boolean;
        refreshed?: boolean;
        sessionId?: string | null;
        user: { id: string; name: string; email: string; role: string; emailVerified: boolean } | null;
      }>(`${MARKETPLACE_API_URL}/api/v1/marketplace/auth/session`, {
        method: 'GET',
        cache: 'no-store',
      });
    },

    logout: () => {
      return request<{ ok: boolean; loggedOut: boolean; message: string }>(
        `${MARKETPLACE_API_URL}/api/v1/marketplace/auth/logout`,
        {
          method: 'POST',
          body: JSON.stringify({}),
        },
      );
    },

    verifyEmail: (payload: { token?: string; email?: string; code?: string }) => {
      return request<{
        message: string;
        user: { id: string; name: string; email: string; role: string; emailVerified: boolean };
        sessionId?: string;
      }>(`${MARKETPLACE_API_URL}/api/v1/marketplace/auth/verify-email`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },

    resendVerification: (email: string) => {
      return request<{
        message: string;
        alreadyVerified?: boolean;
      }>(`${MARKETPLACE_API_URL}/api/v1/marketplace/auth/resend-verification`, {
        method: 'POST',
        body: JSON.stringify({ email, portal: 'marketplace' })
      });
    },

    forgotPassword: (email: string) => {
      return request<{
        message: string;
      }>(`${MARKETPLACE_API_URL}/api/v1/marketplace/auth/forgot-password`, {
        method: 'POST',
        body: JSON.stringify({ email, portal: 'marketplace' })
      });
    },

    verifyResetToken: (payload: { token?: string; email?: string; code?: string }) => {
      return request<{
        valid: boolean;
        email: string;
        expiresAt: number;
      }>(`${MARKETPLACE_API_URL}/api/v1/marketplace/auth/verify-reset-token`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },

    resetPassword: (payload: { token?: string; email?: string; code?: string; newPassword: string }) => {
      return request<{ message: string }>(`${MARKETPLACE_API_URL}/api/v1/marketplace/auth/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ ...payload, portal: 'marketplace' })
      });
    },
  },

  // Products Discovery
  getProducts: (params?: { category?: string; brand?: string; q?: string }) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.set('category', params.category);
    if (params?.brand && params.brand !== 'All') query.set('brand', params.brand);
    if (params?.q) query.set('q', params.q);
    return request<any[]>(`${MARKETPLACE_API_URL}/api/v1/marketplace/products?${query.toString()}`);
  },

  // Single-seller checkout validation
  validateCheckout: (items: Array<{ productId: string; variantSku: string; quantity: number }>) => {
    return request<{ valid: boolean; singleTenantId: string; subtotal: number }>(
      `${MARKETPLACE_API_URL}/api/v1/checkout/validate`,
      {
        method: 'POST',
        body: JSON.stringify({ items })
      }
    );
  },

  // Create confirmed order
  createOrder: (orderPayload: {
    items: Array<{ productId: string; variantSku: string; quantity: number }>;
    shippingAddress: any;
    customerEmail: string;
  }) => {
    return request<{ orderId: string; status: string; total: number }>(
      `${MARKETPLACE_API_URL}/api/v1/checkout`,
      {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      }
    );
  },

  // Dispatch Virtual Try-On via Unified Backend (orchestrates AI generation & Cloudinary CDN persistence)
  submitTryOn: (payload: { productId: string; personImage: string; garmentImage: string; category?: string; prompt?: string }) => {
    return request<{ jobId: string; generationId?: string; accessToken?: string; status: string; queuePosition?: number }>(
      `${MARKETPLACE_API_URL}/api/v1/try-on/submit`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  },

  // Poll Virtual Try-On Result (Backend receives AI output and persists result on Cloudinary CDN)
  // accessToken is the secret returned by submitTryOn; without it the job cannot be read
  getTryOnStatus: (jobId: string, accessToken: string) => {
    return request<{ jobId: string; status: string; resultUrl?: string; output_url?: string; storageProvider?: string }>(
      `${MARKETPLACE_API_URL}/api/v1/try-on/status/${jobId}`,
      { headers: { 'x-try-on-token': accessToken } }
    );
  }
};
