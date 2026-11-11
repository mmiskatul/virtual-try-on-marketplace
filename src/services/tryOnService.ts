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

/**
 * Runs Virtual Try-On against backend + Docker AI service when connected & published.
 * Never fabricates live AI output: explicitly labels Demo Preview Mode when backend is
 * unreachable or garment is storefront/seed-only.
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
    const timer = setTimeout(() => controller.abort(), 20000);
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

    if (res.ok) {
      const data = await res.json();
      const resultUrl =
        data.resultUrl ||
        data.output_url ||
        data.outputImageUrl ||
        data.result?.output_url;

      if (resultUrl) {
        return {
          success: true,
          mode: 'live_ai',
          resultImageUrl: resultUrl,
          jobId: data.jobId || data.job_id || `live_${Date.now()}`,
        };
      }
    }
  } catch {
    // Network / Docker AI unreachable — proceed explicitly to labeled Demo Preview fallback
  }

  // Clearly labeled Demo Preview simulation — never disguised as live neural inference
  await new Promise((r) => setTimeout(r, 900));
  return {
    success: true,
    mode: 'demo_preview',
    resultImageUrl: garmentImage || product.image,
    jobId: `demo_${Date.now()}`,
    notice:
      'Demo Preview Mode: Live AI backend did not process this catalog item (preview-only garment or service paused). Showing garment studio visualization.',
  };
}

