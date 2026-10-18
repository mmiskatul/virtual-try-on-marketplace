import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_PRODUCTS, INITIAL_BRANDS } from '../../../../lib/mock_data';

export const runtime = 'edge';
export const preferredRegion = 'auto';

/**
 * Edge Runtime Data Fetching Handler: Catalog Feed
 * Deployed on the Vercel Edge Network close to the user to minimize TTFB.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);

  const brand = searchParams.get('brand');
  const category = searchParams.get('category');
  const search = searchParams.get('search')?.toLowerCase();

  let products = [...INITIAL_PRODUCTS];

  // Try fetching from the upstream marketplace API with a low timeout, fallback to local edge dataset
  const upstreamApiUrl = process.env.NEXT_PUBLIC_MARKETPLACE_API_URL;
  if (upstreamApiUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // Strict 1.5s timeout for edge resilience

      const res = await fetch(`${upstreamApiUrl}/api/products`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'x-forwarded-for-edge': request.headers.get('x-forwarded-for') || '',
        },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          products = data;
        }
      }
    } catch {
      // Fallback seamlessly to edge-cached static dataset
    }
  }

  // Edge query filtering
  if (brand && brand !== 'all') {
    products = products.filter(
      (p) => p.brandSlug === brand || p.brandName.toLowerCase() === brand.toLowerCase()
    );
  }

  if (category && category !== 'all') {
    products = products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.brandName.toLowerCase().includes(search) ||
        p.fabric.toLowerCase().includes(search)
    );
  }

  const durationMs = Date.now() - startTime;

  return NextResponse.json(
    {
      success: true,
      data: {
        products,
        brands: INITIAL_BRANDS,
        total: products.length,
      },
      edge: {
        runtime: 'Vercel Edge Network (V8 Isolate)',
        durationMs,
        region: process.env.VERCEL_REGION || 'edge-auto',
      },
    },
    {
      status: 200,
      headers: {
        // Edge CDN caching: Cache globally for 60s, serve stale up to 5 minutes while revalidating
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'CDN-Cache-Control': 'max-age=60',
        'Vary': 'Accept-Encoding',
        'x-edge-runtime': 'vercel-edge-v8',
        'server-timing': `edge-ttfb;dur=${durationMs}`,
      },
    }
  );
}
