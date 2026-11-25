import { MARKETPLACE_API_URL, marketplaceFetch } from '@/lib/api';
import { MarketplaceProduct } from '../types';

const API_BASE = MARKETPLACE_API_URL;

export interface TryOnProviderStatus {
  connected: boolean;
  mode: 'local_ai_service' | 'external_api' | 'offline';
  provider: string;
  status: string;
}

export interface TryOnGenerationOutcome {
  success: boolean;
  mode: 'live_ai' | 'demo_preview';
  resultImageUrl: string;
  jobId: string;
  notice?: string;
}

export async function checkTryOnProviderStatus(): Promise<TryOnProviderStatus> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${API_BASE}/api/v1/try-on/provider`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      return {
        connected: true,
        mode: data.mode || 'local_ai_service',
        provider: data.provider || 'local',
        status: data.status || 'ready',
      };
    }
  } catch {
    // Offline
  }
  return {
    connected: false,
    mode: 'offline',
    provider: 'demo-preview',
    status: 'offline',
  };
}

export async function uploadCustomerTryOnPhoto(file: File): Promise<{
  ok: boolean;
  url?: string;
  provider?: string;
  error?: string;
}> {
  const MAX_BYTES = 10 * 1024 * 1024;
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'Please upload a valid image file (JPG, PNG, or WebP).' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'Photo exceeds the 10 MB size limit. Please choose a smaller image.' };
  }

  // Read client Data URL for immediate preview & safe local fallback
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read photo file'));
    reader.readAsDataURL(file);
  });

  // Upload cleanly via backend when reachable so Cloudinary stores remote URL safely
  try {
    const formData = new FormData();
    formData.append('file', file);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await marketplaceFetch(`${API_BASE}/api/v1/try-on/upload`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data?.url) {
        return { ok: true, url: data.url, provider: data.provider || 'cloudinary' };
      }
    }
  } catch {
    // Fallback cleanly to browser dataUrl in offline/demo mode
  }

  return { ok: true, url: dataUrl, provider: 'local_browser' };
}

/** Image generation can take a minute or more (the backend may try a second AI service), so wait for it. */
const TRY_ON_TIMEOUT_MS = 120_000;

const failure = (message: string): TryOnGenerationOutcome => ({
  success: false,
  mode: 'live_ai',
  resultImageUrl: '',
  jobId: '',
  notice: message,
});

/**
 * Runs Virtual Try-On on the backend and waits for the finished picture.
 * It never shows a stand-in picture: when the picture cannot be made, it returns success: false with the reason,
 * so the shopper sees a clear message and can try again instead of a photo of the garment that looks like a result.
 */
export async function executeVirtualTryOn(params: {
  product: MarketplaceProduct;
  personImage: string;
  garmentImage: string;
  size?: string;
  color?: string;
}): Promise<TryOnGenerationOutcome> {
  const { product, personImage, garmentImage } = params;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TRY_ON_TIMEOUT_MS);
    const res = await marketplaceFetch(`${API_BASE}/api/v1/try-on/direct`, {
      method: 'POST',
      headers: {
        'Idempotency-Key': `vton_${product.id}_${Date.now()}`,
      },
      body: JSON.stringify({
        productId: product.id,
        personImage,
        garmentImage,
        category: product.tryOnCategory || 'tops',
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const reason =
        typeof data?.message === 'string' && data.message
          ? data.message
          : res.status === 503
            ? 'Virtual try-on is not set up yet. Please try again later.'
            : 'The try-on could not be created. Please try again.';
      return failure(reason);
    }

    const resultUrl = data.resultUrl || data.output_url || data.outputImageUrl || data.result?.output_url;
    if (resultUrl) {
      return {
        success: true,
        mode: 'live_ai',
        resultImageUrl: resultUrl,
        jobId: data.jobId || data.job_id || `live_${Date.now()}`,
      };
    }
    return failure('The try-on finished but no picture came back. Please try again.');
  } catch (err: unknown) {
    const name = (err as { name?: string })?.name;
    if (name === 'AbortError') {
      return failure('The picture is taking longer than usual. Please try again in a moment.');
    }
    return failure('Could not reach the try-on service. Check your connection and try again.');
  }
}
