import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:4000';
const INTERNAL_SERVICE_KEY =
  process.env.INTERNAL_SERVICE_KEY || 'vton_internal_service_key_dev';

const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    name: 'Customer Account',
    credentials: {
      email: { label: 'Email', type: 'email', placeholder: 'customer@example.com' },
      password: { label: 'Password', type: 'password' },
      verifiedToken: { label: 'Verified Token', type: 'text' },
    },
    async authorize(credentials) {
      // Verified OTP token handoff immediately after /verify-email
      if (credentials?.verifiedToken) {
        let meRes: Response;
        try {
          meRes = await fetch(`${BACKEND_API_URL}/api/v1/marketplace/auth/me`, {
            headers: { Authorization: `Bearer ${credentials.verifiedToken}` },
          });
        } catch {
          throw new Error('SERVICE_UNAVAILABLE');
        }
        const meData = await meRes.json().catch(() => ({}));
        if (!meRes.ok || !meData?.user) {
          throw new Error('Invalid or expired verification session.');
        }
        return {
          id: meData.user.id,
          name: meData.user.name,
          email: meData.user.email,
          image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          role: meData.user.role || 'CUSTOMER',
          emailVerified: Boolean(meData.user.emailVerified),
          backendToken: credentials.verifiedToken,
        };
      }

      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email and password are required.');
      }

      let response: Response;
      try {
        response = await fetch(`${BACKEND_API_URL}/api/v1/marketplace/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        role: data.user.role || 'CUSTOMER',
        emailVerified: Boolean(data.user.emailVerified),
        backendToken: data.token
      };
    }
  })
];

// Conditionally enable Google OAuth if environment credentials exist
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
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
    async jwt({ token, user, account }) {
      if (account?.provider === 'google' && user?.email) {
        try {
          const syncRes = await fetch(`${BACKEND_API_URL}/api/v1/marketplace/auth/oauth-google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Service-Key': INTERNAL_SERVICE_KEY,
            },
            body: JSON.stringify({ email: user.email, name: user.name }),
          });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            token.id = syncData.user?.id || token.id;
            token.role = syncData.user?.role || 'CUSTOMER';
            token.backendToken = syncData.token;
            token.emailVerified = true;
            return token;
          }
        } catch {
          // Keep standard NextAuth OAuth session if backend sync is temporarily unavailable
        }
      }
      if (user) {
        token.id = user.id;
        token.role = user.role || 'CUSTOMER';
        token.backendToken = user.backendToken;
        token.emailVerified = Boolean(user.emailVerified);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || '';
        session.user.role = (token.role as string) || 'CUSTOMER';
        session.user.emailVerified = Boolean(token.emailVerified);
      }
      session.backendToken = token.backendToken;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'vton-marketplace-fallback-secret-key-32chars'
};
