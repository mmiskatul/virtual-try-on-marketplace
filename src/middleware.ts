import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {
  MKT_ACCESS_COOKIE,
  MKT_REFRESH_COOKIE,
  MKT_SESSION_COOKIE,
  buildMktCookieHeader,
  exchangeMktOAuthCodeFromBackend,
  isAllowedCustomerRole,
  isValidMktAccessCookie,
  isValidMktRefreshCookie,
  refreshMktSessionFromBackend,
  sanitizeMktCallbackUrl,
  verifyMktSessionWithBackend,
} from './lib/portal-auth';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

const AUTH_ENTRY_PATHS = ['/login', '/register'];
const PROTECTED_ROUTES = ['/checkout', '/orders', '/account', '/saved-looks', '/notifications', '/api/checkout'];
const PUBLIC_META_PREFIXES = ['/api/auth', '/manifest.webmanifest', '/robots.txt', '/sitemap.xml'];

function buildMergedCookieHeader(rawCookie: string | null, setCookies: string[]): string {
  const cookieMap = new Map<string, string>();
  if (rawCookie) {
    for (const part of rawCookie.split(';')) {
      const idx = part.indexOf('=');
      if (idx > 0) {
        const k = part.slice(0, idx).trim();
        const v = part.slice(idx + 1).trim();
        if (k) cookieMap.set(k, v);
      }
    }
  }
  for (const sc of setCookies) {
    const firstSemi = sc.indexOf(';');
    const kv = (firstSemi >= 0 ? sc.slice(0, firstSemi) : sc).trim();
    const idx = kv.indexOf('=');
    if (idx > 0) {
      const k = kv.slice(0, idx).trim();
      const v = kv.slice(idx + 1).trim();
      if (!v || /;\s*Max-Age=0\b/i.test(sc)) {
        cookieMap.delete(k);
      } else {
        cookieMap.set(k, v);
      }
    }
  }
  return Array.from(cookieMap.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

/**
 * Generate a strict, dynamic Content Security Policy (CSP) with a cryptographic nonce.
 * Blocks Cross-Site Scripting (XSS) attacks, clickjacking, and unauthorized script injection.
 */
function createContentSecurityPolicy(nonce: string) {
  const isDev = process.env.NODE_ENV !== 'production';

  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ''} https:;
    style-src 'self' 'unsafe-inline' https:;
    img-src 'self' blob: data: https://images.unsplash.com https:;
    font-src 'self' data: https:;
    connect-src 'self' http://localhost:* ws://localhost:* https:;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://accounts.google.com;
    frame-ancestors 'none';
    ${isDev ? '' : 'block-all-mixed-content; upgrade-insecure-requests;'}
  `
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  // Official V-TRY Studio domains: vtrystudio.com, shop.brand.*, admin.*, www.*
  /^https:\/\/([a-z0-9-]+\.)*vtrystudio\.com$/,
];

function isOriginAllowed(origin: string | null, requestOrigin?: string): boolean {
  if (!origin) return true;
  if (requestOrigin && origin === requestOrigin) return true;
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredSiteUrl) {
    try {
      if (origin === new URL(configuredSiteUrl).origin) return true;
    } catch {
      // Ignore invalid URL env
    }
  }
  return ALLOWED_ORIGIN_PATTERNS.some((p) => p.test(origin));
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
let lastCleanup = Date.now();

function checkEdgeRateLimit(
  clientIp: string,
  pathname: string,
  exempt = false,
): { success: boolean; limit: number; remaining: number; reset: number } {
  // Never throttle NextAuth session/csrf/_log polling, Next.js RSC prefetches, or local development:
  // one page load fires many of these and they would exhaust the per-IP budget (HTTP 429).
  if (exempt) return { success: true, limit: 0, remaining: 0, reset: 0 };
  const now = Date.now();
  if (now - lastCleanup > 300000) {
    lastCleanup = now;
    rateLimitStore.forEach((v, k) => {
      if (v.resetAt <= now) rateLimitStore.delete(k);
    });
  }

  const isSensitive = pathname.startsWith('/api/checkout') || pathname.startsWith('/api/auth');
  const limit = isSensitive ? 30 : 120;
  const windowMs = 60000;

  const key = `${clientIp}:${isSensitive ? 'sensitive' : 'standard'}`;
  let record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    record = { count: 1, resetAt: now + windowMs };
    rateLimitStore.set(key, record);
    return { success: true, limit, remaining: limit - 1, reset: Math.ceil((record.resetAt - now) / 1000) };
  }

  record.count += 1;
  const remaining = Math.max(0, limit - record.count);
  const reset = Math.ceil((record.resetAt - now) / 1000);

  if (record.count > limit) {
    return { success: false, limit, remaining: 0, reset };
  }

  return { success: true, limit, remaining, reset };
}

/**
 * Edge Runtime Middleware enforcing HttpOnly session/access/refresh cookies,
 * NextAuth JWT alignment, silent refresh rotation, Strict CORS & Edge Rate Limiting.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/forget-password') {
    return NextResponse.redirect(new URL('/forgot-password', request.url));
  }
  const origin = request.headers.get('origin');
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  // 1. Edge-Level Strict CORS Preflight & Origin Verification
  if (pathname.startsWith('/api/')) {
    if (origin && !isOriginAllowed(origin, request.nextUrl.origin)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Cross-origin request blocked by Edge CORS policy' },
        { status: 403 },
      );
    }

    if (request.method === 'OPTIONS') {
      const preflightHeaders: Record<string, string> = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tenant-id, x-client-version',
        'Access-Control-Max-Age': '86400',
      };
      if (origin && isOriginAllowed(origin, request.nextUrl.origin)) {
        preflightHeaders['Access-Control-Allow-Origin'] = origin;
        preflightHeaders['Access-Control-Allow-Credentials'] = 'true';
      }
      return new NextResponse(null, {
        status: 204,
        headers: preflightHeaders,
      });
    }
  }

  // 2. Edge-Level Sliding-Window Rate Limiting
  const exemptFromRateLimit =
    process.env.NODE_ENV !== 'production' ||
    request.nextUrl.searchParams.has('_rsc') ||
    request.headers.has('next-router-prefetch') ||
    /^[/]api[/]auth[/](session|csrf|providers|_log)([/]|$)/.test(pathname);
  const rateLimit = checkEdgeRateLimit(clientIp, pathname, exemptFromRateLimit);
  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: 'TooManyRequests',
        code: 'EDGE_RATE_LIMIT_EXCEEDED',
        message: `Too many requests from this client. Please retry after ${rateLimit.reset} seconds.`,
        retryAfter: rateLimit.reset,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.reset),
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimit.reset),
        },
      },
    );
  }

  // 3. Generate Cryptographic Nonce & Shared Response Header Helper
  const nonce = btoa(crypto.randomUUID());
  const cspHeader = createContentSecurityPolicy(nonce);
  const geoCountry = request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country') || 'US';
  const geoCity = request.headers.get('cf-ipcity') || request.headers.get('x-vercel-ip-city') || 'Edge';
  let clearStaleAuthCookies = false;

  const applyResponseHeaders = (
    res: NextResponse,
    setCookiesToForward: string[] = [],
  ) => {
    res.headers.set('Content-Security-Policy', cspHeader);
    res.headers.set('x-nonce', nonce);
    res.headers.set('x-content-type-options', 'nosniff');
    res.headers.set('x-frame-options', 'DENY');
    res.headers.set('x-xss-protection', '1; mode=block');
    res.headers.set('x-edge-geo', `${geoCity}, ${geoCountry}`);
    res.headers.set('x-edge-runtime', 'vercel-edge-v8');
    if (rateLimit.limit > 0) {
      res.headers.set('X-RateLimit-Limit', String(rateLimit.limit));
      res.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
      res.headers.set('X-RateLimit-Reset', String(rateLimit.reset));
    }
    if (origin && isOriginAllowed(origin)) {
      res.headers.set('Access-Control-Allow-Origin', origin);
      res.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    if (clearStaleAuthCookies) {
      res.cookies.delete(MKT_ACCESS_COOKIE);
      res.cookies.delete(MKT_REFRESH_COOKIE);
      res.cookies.delete(MKT_SESSION_COOKIE);
      res.cookies.delete('next-auth.session-token');
      res.cookies.delete('__Secure-next-auth.session-token');
    }
    for (const sc of setCookiesToForward) {
      res.headers.append('set-cookie', sc);
    }
    return res;
  };

  // NextAuth API routes & static SEO files pass through without auth gating
  if (PUBLIC_META_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', cspHeader);
    requestHeaders.set('x-edge-routed', 'true');
    requestHeaders.set('x-edge-runtime', 'vercel-edge-v8');
    return applyResponseHeaders(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  // 4. Verify BOTH NextAuth session JWT AND HttpOnly marketplace session/access/refresh cookies
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const nextAuthUserId =
    typeof token?.id === 'string'
      ? token.id
      : typeof token?.sub === 'string'
        ? token.sub
        : '';
  const hasNextAuthCustomer = Boolean(
    token && nextAuthUserId && isAllowedCustomerRole(token.role || 'CUSTOMER'),
  );

  const accessCookie = request.cookies.get(MKT_ACCESS_COOKIE)?.value;
  const refreshCookie = request.cookies.get(MKT_REFRESH_COOKIE)?.value;
  const sessionCookie = request.cookies.get(MKT_SESSION_COOKIE)?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isAuthEntryPage = AUTH_ENTRY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isVerifyWithoutCode =
    pathname.startsWith('/verify-email') &&
    !request.nextUrl.searchParams.has('token') &&
    !request.nextUrl.searchParams.has('code');

  let hasValidAccess =
    hasNextAuthCustomer && isValidMktAccessCookie(accessCookie, nextAuthUserId, sessionCookie);

  if (hasValidAccess && accessCookie) {
    const backendSession = await verifyMktSessionWithBackend(
      buildMktCookieHeader({ accessToken: accessCookie, sessionToken: sessionCookie }),
      nextAuthUserId,
    );
    if (!backendSession.ok) {
      hasValidAccess = false;
      clearStaleAuthCookies = true;
    }
  }

  let refreshedSetCookies: string[] = [];
  let refreshedOk = false;

  if (
    hasNextAuthCustomer &&
    !hasValidAccess &&
    isValidMktRefreshCookie(refreshCookie, nextAuthUserId, sessionCookie)
  ) {
    const refreshResult = await refreshMktSessionFromBackend(request.headers.get('cookie') || '');
    if (refreshResult.ok) {
      refreshedOk = true;
      clearStaleAuthCookies = false;
      refreshedSetCookies = refreshResult.setCookies;
    } else if (refreshResult.revoked) {
      clearStaleAuthCookies = true;
      refreshedSetCookies = refreshResult.setCookies;
    }
  }

  // Exchange single-use Google OAuth handoff code into HttpOnly cookies if user lands directly on a protected route
  if (
    hasNextAuthCustomer &&
    !hasValidAccess &&
    !refreshedOk &&
    !request.headers.has('next-router-prefetch') &&
    typeof token?.oauthExchangeCode === 'string' &&
    token.oauthExchangeCode
  ) {
    const exchangeResult = await exchangeMktOAuthCodeFromBackend(token.oauthExchangeCode);
    if (exchangeResult.ok && exchangeResult.setCookies.length > 0) {
      refreshedOk = true;
      clearStaleAuthCookies = false;
      refreshedSetCookies = exchangeResult.setCookies;
    }
  }

  const isAuthenticated = hasNextAuthCustomer && (hasValidAccess || refreshedOk);

  // Redirect already-authenticated customers away from /login or /register
  if (isAuthenticated && (isAuthEntryPage || isVerifyWithoutCode)) {
    const targetPath = sanitizeMktCallbackUrl(
      request.nextUrl.searchParams.get('callbackUrl'),
      '/',
    );
    return applyResponseHeaders(
      NextResponse.redirect(new URL(targetPath, request.url)),
      refreshedSetCookies,
    );
  }

  // 5. Block unauthenticated or tokenless requests to customer-private routes & APIs
  if (isProtectedRoute && !isAuthenticated) {
    if (
      Boolean(accessCookie) ||
      Boolean(refreshCookie) ||
      Boolean(sessionCookie) ||
      request.cookies.has('next-auth.session-token') ||
      request.cookies.has('__Secure-next-auth.session-token')
    ) {
      clearStaleAuthCookies = true;
    }
    if (pathname.startsWith('/api/')) {
      return applyResponseHeaders(
        NextResponse.json(
          {
            success: false,
            error: 'Unauthorized: Customer login and valid HttpOnly access token required.',
            code: 'EDGE_AUTH_REQUIRED',
          },
          { status: 401 },
        ),
        refreshedSetCookies,
      );
    }

    const loginUrl = new URL('/login', request.url);
    const requestedPath = `${pathname}${request.nextUrl.search || ''}`;
    loginUrl.searchParams.set('callbackUrl', requestedPath);
    return applyResponseHeaders(NextResponse.redirect(loginUrl), refreshedSetCookies);
  }

  // 6. Propagate merged refreshed HttpOnly cookies & cryptographic nonce downstream
  const requestHeaders = new Headers(request.headers);
  if (refreshedSetCookies.length > 0) {
    requestHeaders.set(
      'cookie',
      buildMergedCookieHeader(request.headers.get('cookie'), refreshedSetCookies),
    );
    requestHeaders.set('x-auth-edge-refreshed', '1');
  }
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);
  requestHeaders.set('x-edge-routed', 'true');
  requestHeaders.set('x-edge-runtime', 'vercel-edge-v8');

  if (isAuthenticated && token) {
    requestHeaders.set('x-auth-user-id', nextAuthUserId);
    requestHeaders.set('x-auth-user-email', token.email || '');
    requestHeaders.set('x-auth-user-role', (token.role as string) || 'CUSTOMER');
    requestHeaders.set('x-auth-verified-edge', 'true');
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return applyResponseHeaders(response, refreshedSetCookies);
}
