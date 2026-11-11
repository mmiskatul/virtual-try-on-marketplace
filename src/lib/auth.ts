import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:4000';

const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    name: 'Customer Account',
    credentials: {
      email: { label: 'Email', type: 'email', placeholder: 'customer@example.com' },
      password: { label: 'Password', type: 'password' }
    },
    async authorize(credentials) {
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
    async jwt({ token, user }) {
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
