import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import {
  MKT_ACCESS_COOKIE,
  MKT_REFRESH_COOKIE,
  MKT_SESSION_COOKIE,
  buildMktCookieHeader,
  isAllowedCustomerRole,
  isValidMktAccessCookie,
  isValidMktRefreshCookie,
  verifyMktSessionWithBackend,
} from './portal-auth';

export interface VerifiedCustomerSession {
  userId: string;
  email: string;
  name?: string | null;
  role: string;
}

/**
 * Verifies NextAuth customer session + HttpOnly backend session/access/refresh cookies
 * in Server Components, Route Handlers, and Server Actions.
 */
export async function getVerifiedCustomerSession(): Promise<VerifiedCustomerSession | null> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const role = session?.user?.role || 'CUSTOMER';

  if (!session?.user || !userId || !isAllowedCustomerRole(role)) {
    return null;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(MKT_ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(MKT_REFRESH_COOKIE)?.value;
  const sessionCookie = cookieStore.get(MKT_SESSION_COOKIE)?.value;

  const hasValidAccess = isValidMktAccessCookie(accessToken, userId, sessionCookie);
  const hasValidRefresh = isValidMktRefreshCookie(refreshToken, userId, sessionCookie);

  if (!hasValidAccess && !hasValidRefresh) {
    return null;
  }

  const sessionCheckCookie = hasValidAccess
    ? buildMktCookieHeader({ accessToken, sessionToken: sessionCookie })
    : buildMktCookieHeader({ accessToken, sessionToken: sessionCookie, refreshToken });

  const verification = await verifyMktSessionWithBackend(sessionCheckCookie, userId);
  if (!verification.ok) {
    return null;
  }

  return {
    userId,
    email: session.user.email || '',
    name: session.user.name,
    role,
  };
}

export async function requireCustomerPageSession(
  loginRedirect = '/login',
): Promise<VerifiedCustomerSession> {
  const verified = await getVerifiedCustomerSession();
  if (!verified) {
    redirect(loginRedirect);
  }
  return verified;
}

export async function requireCustomerServerAction(): Promise<VerifiedCustomerSession> {
  const verified = await getVerifiedCustomerSession();
  if (!verified) {
    throw new Error('Unauthorized: Customer login and valid HttpOnly access token required.');
  }
  return verified;
}

