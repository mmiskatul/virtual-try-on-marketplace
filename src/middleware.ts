import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

// Protected routes requiring verified customer authentication at the routing edge
const PROTECTED_ROUTES = ['/checkout', '/orders', '/account', '/saved-looks', '/api/checkout'];

/**
 * Generate a strict, dynamic Content Security Policy (CSP) with a cryptographic nonce.
 * Blocks Cross-Site Scripting (XSS) attacks, clickjacking, and unauthorized script injection.
 */
function createContentSecurityPolicy(nonce: string) {
  const isDev = process.env.NODE_ENV !== 'production';

  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ''} https:;
    style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https:;
    img-src 'self' blob: data: https://images.unsplash.com https:;
    font-src 'self' data: https:;
    connect-src 'self' http://localhost:* ws://localhost:* https:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Edge Runtime Middleware with Token Verification & Cryptographic CSP Nonce Injection
 * 1. Generates a unique, cryptographically random nonce per request.
 * 2. Injects Content Security Policy (CSP) headers into both request and response.
 * 3. Enforces edge token verification on protected routes.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Generate Cryptographic Nonce using Web Crypto
  const nonce = btoa(crypto.randomUUID());
  const cspHeader = createContentSecurityPolicy(nonce);

  // 2. Edge Token & Session Verification using NextAuth JWT
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'vton-marketplace-fallback-secret-key-32chars',
  });

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  // 3. Block unauthorized requests immediately at the routing edge
  if (isProtectedRoute && !token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Valid customer session token or JWT required at edge routing layer.',
          code: 'EDGE_AUTH_REQUIRED',
        },
        {
          status: 401,
          headers: {
            'Content-Security-Policy': cspHeader,
            'x-nonce': nonce,
          },
        }
      );
    }

    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('auth', 'required');
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Prepare Verified Downstream Request Headers with Injected Nonce
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);
  requestHeaders.set('x-edge-routed', 'true');
  requestHeaders.set('x-edge-runtime', 'vercel-edge-v8');

  if (token) {
    requestHeaders.set('x-auth-user-id', (token.id as string) || (token.sub as string) || '');
    requestHeaders.set('x-auth-user-email', token.email || '');
    requestHeaders.set('x-auth-user-role', (token.role as string) || 'CUSTOMER');
    requestHeaders.set('x-auth-verified-edge', 'true');
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Attach Security & Telemetry Headers to HTTP Response
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('x-nonce', nonce);
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('x-frame-options', 'DENY');
  response.headers.set('x-xss-protection', '1; mode=block');

  // Propagate geo-location info
  const geoCountry = request.geo?.country || request.headers.get('x-vercel-ip-country') || 'US';
  const geoCity = request.geo?.city || request.headers.get('x-vercel-ip-city') || 'Edge';
  response.headers.set('x-edge-geo', `${geoCity}, ${geoCountry}`);
  response.headers.set('x-edge-runtime', 'vercel-edge-v8');

  return response;
}
