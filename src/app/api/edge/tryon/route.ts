import { NextRequest, NextResponse } from 'next/server';


/**
 * Edge Runtime Data Routing Handler: AI Try-On Job Dispatch
 * Dispatches and proxies virtual try-on jobs on edge nodes closest to the user.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { userImageUrl, garmentImageUrl, clothType, productId } = body;

    if (!userImageUrl || !garmentImageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: userImageUrl and garmentImageUrl are required.',
        },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:4000';
    let jobResult: any = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 110000); // image generation can take a minute or more

      const incomingCookie = request.headers.get('cookie');
      // Route through backend: triggers AI generation and automatic Cloudinary upload
      const backendResponse = await fetch(`${backendUrl}/api/v1/try-on/direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Portal': 'marketplace',
          'X-Auth-Transport': 'cookie',
          ...(incomingCookie ? { Cookie: incomingCookie } : {}),
          'x-edge-client-ip': request.headers.get('x-forwarded-for') || '',
        },
        body: JSON.stringify({
          personImage: userImageUrl,
          garmentImage: garmentImageUrl,
          category: clothType || 'tops',
          productId, // server resolves the shop from the product; the browser never chooses the tenant
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (backendResponse.ok) {
        jobResult = await backendResponse.json();
      }
    } catch {
      // Graceful fallback simulation if backend is warming up
    }

    const durationMs = Date.now() - startTime;
    const jobId = jobResult?.job_id || jobResult?.jobId || `edge_vton_${Date.now()}`;
    const outputImageUrl =
      jobResult?.output_image_url ||
      jobResult?.resultUrl ||
      jobResult?.result?.output_url ||
      '';

    // Never answer with a stand-in picture: if no real result came back, say so.
    if (!outputImageUrl) {
      return NextResponse.json(
        { success: false, jobId, error: 'The try-on picture could not be created. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        jobId,
        status: jobResult?.status || 'COMPLETED',
        clothType: clothType || 'upper_body',
        outputImageUrl,
        edgeTelemetry: {
          dispatchedAtEdge: true,
          durationMs,
          region: process.env.VERCEL_REGION || 'edge-auto',
        },
      },
      {
        status: 200,
        headers: {
          'x-edge-runtime': 'cloudflare-workers',
          'server-timing': `edge-dispatch;dur=${durationMs}`,
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Edge request parsing failed',
      },
      { status: 500 }
    );
  }
}
