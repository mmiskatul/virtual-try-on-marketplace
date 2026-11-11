const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:4000';

export interface AsyncTryOnResult {
  mode: 'live_ai' | 'unavailable';
  jobId?: string;
  status?: string;
  resultUrl?: string;
  message?: string;
}

function getMarketplaceToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('marketplace_token');
}

export async function uploadPersonPhotoSigned(file: File): Promise<{
  bucket: string;
  objectKey: string;
  uploadId: string;
}> {
  const token = getMarketplaceToken();
  const intentRes = await fetch(`${API_BASE}/api/v1/try-on/upload-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      contentType: file.type || 'image/jpeg',
      sizeBytes: file.size || 1024,
      consentGiven: true,
    }),
  });
  if (!intentRes.ok) {
    throw new Error(`Upload intent failed (${intentRes.status})`);
  }
  const intentJson = await intentRes.json();
  const intent = intentJson.data || intentJson;
  const uploadUrl = intent.uploadUrl.startsWith('http') ? intent.uploadUrl : `${API_BASE}${intent.uploadUrl}`;

  const putRes = await fetch(uploadUrl, {
    method: intent.method || 'PUT',
    headers: {
      'Content-Type': file.type || 'image/jpeg',
      ...(intent.headers || {}),
    },
    body: file,
  });
  if (!putRes.ok) {
    throw new Error(`Signed photo upload failed (${putRes.status})`);
  }
  return {
    uploadId: intent.uploadId,
    bucket: intent.bucket,
    objectKey: intent.objectKey,
  };
}

export async function runAsyncTryOnPipeline(params: {
  productId: string;
  personUpload?: { bucket: string; objectKey: string };
  personImageUrl?: string;
  garmentImageUrl?: string;
  category?: string;
  quality?: 'fast_preview' | 'standard' | 'high_fidelity';
  onStatus?: (status: string) => void;
}): Promise<AsyncTryOnResult> {
  const token = getMarketplaceToken();
  const idemKey = `tryon_${params.productId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  try {
    const submitRes = await fetch(`${API_BASE}/api/v1/try-on/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idemKey,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        productId: params.productId,
        personUpload: params.personUpload,
        personImageUrl: params.personImageUrl,
        garmentImageUrl: params.garmentImageUrl,
        category: params.category,
        quality: params.quality || 'standard',
      }),
    });

    if (!submitRes.ok) {
      const err = await submitRes.json().catch(() => ({}));
      return {
        mode: 'unavailable',
        message: err?.message || `Failed to queue try-on job (${submitRes.status})`,
      };
    }

    const submitJson = await submitRes.json();
    const job = submitJson.data || submitJson;
    const jobId = job.jobId;
    const jobToken = job.accessToken;
    params.onStatus?.(job.status || 'QUEUED');

    if (job.status === 'COMPLETED' && job.resultUrl) {
      return { mode: 'live_ai', jobId, status: 'COMPLETED', resultUrl: job.resultUrl };
    }

    // Try SSE first in browser, falling back cleanly to short polling
    if (typeof window !== 'undefined' && typeof EventSource !== 'undefined') {
      try {
        const sseUrl = `${API_BASE}/api/v1/try-on/jobs/${encodeURIComponent(jobId)}/events${jobToken ? `?token=${encodeURIComponent(jobToken)}` : ''}`;
        const settled = await new Promise<AsyncTryOnResult | null>((resolve) => {
          const es = new EventSource(sseUrl);
          const timer = setTimeout(() => {
            es.close();
            resolve(null);
          }, 25000);
          es.addEventListener('status', (e: MessageEvent) => {
            try {
              const payload = JSON.parse(e.data);
              params.onStatus?.(payload.status);
              if (payload.status === 'COMPLETED' && payload.resultUrl) {
                clearTimeout(timer);
                es.close();
                resolve({ mode: 'live_ai', jobId, status: 'COMPLETED', resultUrl: payload.resultUrl });
              } else if (payload.status === 'FAILED' || payload.status === 'CANCELLED') {
                clearTimeout(timer);
                es.close();
                resolve({
                  mode: 'unavailable',
                  jobId,
                  status: payload.status,
                  message: payload.errorMessage || 'Try-on generation failed.',
                });
              }
            } catch {
              // ignore malformed SSE chunk
            }
          });
          es.onerror = () => {
            clearTimeout(timer);
            es.close();
            resolve(null);
          };
        });
        if (settled) return settled;
      } catch {
        // fallback to polling below
      }
    }

    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 1200));
      const pollRes = await fetch(`${API_BASE}/api/v1/try-on/jobs/${encodeURIComponent(jobId)}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(jobToken ? { 'x-try-on-token': jobToken } : {}),
        },
        cache: 'no-store',
      });
      if (!pollRes.ok) continue;
      const pollJson = await pollRes.json();
      const pollJob = pollJson.data || pollJson;
      params.onStatus?.(pollJob.status);
      if (pollJob.status === 'COMPLETED' && pollJob.resultUrl) {
        return { mode: 'live_ai', jobId, status: 'COMPLETED', resultUrl: pollJob.resultUrl };
      }
      if (pollJob.status === 'FAILED' || pollJob.status === 'CANCELLED') {
        return {
          mode: 'unavailable',
          jobId,
          status: pollJob.status,
          message: pollJob.errorMessage || 'Try-on generation failed.',
        };
      }
    }

    return { mode: 'unavailable', jobId, status: 'TIMEOUT', message: 'Try-on job timed out waiting for completion.' };
  } catch (err: any) {
    return { mode: 'unavailable', message: err?.message || 'Try-on service unavailable.' };
  }
}

export async function fetchTryOnHistory() {
  const token = getMarketplaceToken();
  if (!token) return [];
  const res = await fetch(`${API_BASE}/api/v1/try-on/jobs`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json?.data?.jobs || [];
}

