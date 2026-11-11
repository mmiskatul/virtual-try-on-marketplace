import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:4000';

export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const jwt = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!jwt) {
      return NextResponse.json({ ok: false, needsReauth: true }, { status: 401 });
    }

    // 1. Check whether browser already holds valid backend HttpOnly session/refresh cookies
    if (cookieHeader) {
      const checkRes = await fetch(`${BACKEND_API_URL}/api/v1/marketplace/auth/session`, {
        method: 'GET',
        headers: {
          Cookie: cookieHeader,
          'X-Auth-Portal': 'marketplace',
          'X-Auth-Transport': 'cookie',
        },
        cache: 'no-store',
      });
      const checkData = await checkRes.json().catch(() => ({}));
      const out = NextResponse.json({
        ok: Boolean(checkData?.authenticated),
        alreadyAuthenticated: Boolean(checkData?.authenticated),
        user: checkData?.user || null,
      });
      const checkCookies =
        typeof (checkRes.headers as any).getSetCookie === 'function'
          ? ((checkRes.headers as any).getSetCookie() as string[])
          : [];
      for (const c of checkCookies) {
        out.headers.append('Set-Cookie', c);
      }
      if (checkData?.authenticated) {
        return out;
      }
    }

    // 2. Complete one-time Google OAuth exchange into HttpOnly cookies
    const code = typeof jwt.oauthExchangeCode === 'string' ? jwt.oauthExchangeCode : '';
    if (!code) {
      return NextResponse.json({ ok: false, needsReauth: true }, { status: 401 });
    }

    const exRes = await fetch(`${BACKEND_API_URL}/api/v1/marketplace/auth/oauth-exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Portal': 'marketplace',
        'X-Auth-Transport': 'cookie',
      },
      body: JSON.stringify({ code }),
      cache: 'no-store',
    });

    const exData = await exRes.json().catch(() => ({}));
    if (!exRes.ok || !exData?.ok) {
      return NextResponse.json({ ok: false, needsReauth: exRes.status === 401 }, { status: exRes.status || 401 });
    }

    const res = NextResponse.json({ ok: true, user: exData.user });
    const setCookies =
      typeof (exRes.headers as any).getSetCookie === 'function'
        ? ((exRes.headers as any).getSetCookie() as string[])
        : [];
    for (const c of setCookies) {
      res.headers.append('Set-Cookie', c);
    }
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

