import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:4000';

function readCookieHeader(req: any): string | undefined {
  const headers = req?.headers;
  if (!headers) return undefined;
  if (typeof headers.get === 'function') {
    return headers.get('cookie') || undefined;
  }
  return typeof headers.cookie === 'string' ? headers.cookie : undefined;
}

const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    name: 'Customer Account',
    credentials: {
      email: { label: 'Email', type: 'email', placeholder: 'customer@example.com' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials, req) {
      // Primary cookie-first flow: browser called :4000/login or :4000/verify-email first (setting HttpOnly cookies),
      // then invokes signIn('credentials') so NextAuth verifies the HttpOnly session without storing tokens in JS/JWT.
      const cookieHeader = readCookieHeader(req);
      if (cookieHeader && (cookieHeader.includes('vtry_mkt_access=') || cookieHeader.includes('vtry_mkt_refresh='))) {
        try {
          const sessionRes = await fetch(`${BACKEND_API_URL}/api/v1/marketplace/auth/session`, {
            method: 'GET',
            headers: {
              Cookie: cookieHeader,
              'X-Auth-Portal': 'marketplace',
              'X-Auth-Transport': 'cookie',
            },
            cache: 'no-store',
          });
          const sessionData = await sessionRes.json().catch(() => ({}));
          if (sessionRes.ok && sessionData?.authenticated && sessionData?.user) {
            if (sessionData.user.role && sessionData.user.role !== 'CUSTOMER') {
              throw new Error('This portal is restricted to Customer accounts.');
            }
            return {
              id: sessionData.user.id,
              name: sessionData.user.name,
              email: sessionData.user.email,
              role: sessionData.user.role || 'CUSTOMER',
              emailVerified: Boolean(sessionData.user.emailVerified),
            };
          }
        } catch (err: any) {
          if (err?.message?.includes('restricted')) throw err;
        }
      }

      if (!credentials?.email || !credentials?.password) {
        throw new Error('Authentication session cookie expired. Please sign in again.');
      }

      let response: Response;
      try {
        response = await fetch(`${BACKEND_API_URL}/api/v1/marketplace/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Portal': 'marketplace',
            'X-Auth-Transport': 'cookie',
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password
          })
        });
      } catch {
        throw new Error('SERVICE_UNAVAILABLE');
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data?.code === 'EMAIL_NOT_VERIFIED') {
          throw new Error('EMAIL_NOT_VERIFIED');
        }
        throw new Error(data?.message || 'Invalid email or password.');
      }

      if (!data?.user) {
        return null;
      }

      return {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || 'CUSTOMER',
        emailVerified: Boolean(data.user.emailVerified),
      };
    }
  })
];

// Conditionally enable Google OAuth if environment credentials exist
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    })
  );
}

// Conditionally enable GitHub OAuth if environment credentials exist
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!account.id_token || !user?.email) {
          return '/login?error=GoogleSyncFailed';
        }
        try {
          const syncRes = await fetch(`${BACKEND_API_URL}/api/v1/marketplace/auth/oauth-google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Auth-Portal': 'marketplace',
              'X-Auth-Transport': 'cookie',
            },
            body: JSON.stringify({ idToken: account.id_token, email: user.email, name: user.name }),
          });
          const syncData = await syncRes.json().catch(() => ({}));
          if (!syncRes.ok || !syncData?.oauthExchangeCode || !syncData?.user?.id) {
            if (syncData?.error === 'PortalMismatch') {
              return '/login?error=PortalMismatch';
            }
            return '/login?error=GoogleSyncFailed';
          }
          user.id = syncData.user.id;
          user.name = syncData.user.name || user.name;
          user.email = syncData.user.email || user.email;
          user.role = syncData.user.role || 'CUSTOMER';
          user.oauthExchangeCode = syncData.oauthExchangeCode;
          user.emailVerified = true;
          return true;
        } catch {
          return '/login?error=GoogleSyncFailed';
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'CUSTOMER';
        token.emailVerified = Boolean(user.emailVerified);
        if (user.oauthExchangeCode) {
          token.oauthExchangeCode = user.oauthExchangeCode;
        }
        if (user.image) {
          token.picture = user.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || '';
        session.user.role = (token.role as string) || 'CUSTOMER';
        session.user.emailVerified = Boolean(token.emailVerified);
        if (typeof token.picture === 'string' && token.picture) {
          session.user.image = token.picture;
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};
