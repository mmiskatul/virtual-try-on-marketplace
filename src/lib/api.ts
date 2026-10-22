/**
 * Production API Client for Central Fashion Marketplace
 * Handles communication with backend-api (:4000) and ai-service (:8000)
 */

const MARKETPLACE_API_URL = process.env.NEXT_PUBLIC_MARKETPLACE_API_URL || 'http://localhost:4000';
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

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
  submitTryOn: (payload: { personImage: string; garmentImage: string; category?: string; prompt?: string }) => {
    return request<{ jobId: string; status: string; queuePosition?: number }>(
      `${MARKETPLACE_API_URL}/api/v1/try-on/submit`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  },

  // Poll Virtual Try-On Result (Backend receives AI output and persists result on Cloudinary CDN)
  getTryOnStatus: (jobId: string) => {
    return request<{ jobId: string; status: string; resultUrl?: string; output_url?: string; storageProvider?: string }>(
      `${MARKETPLACE_API_URL}/api/v1/try-on/status/${jobId}`
    );
  }
};
