import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    name: 'Customer Demo & Password',
    credentials: {
      email: { label: 'Email', type: 'email', placeholder: 'customer@example.com' },
      password: { label: 'Password', type: 'password' }
    },
    async authorize(credentials) {
      if (!credentials?.email) {
        return null;
      }

      // Demo/seeded customer authentication check
      if (credentials.email === 'sarah.miller@example.com' || credentials.email.endsWith('@example.com')) {
        return {
          id: 'cust_sarah_01',
          name: 'Sarah Miller',
          email: credentials.email,
          image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          role: 'CUSTOMER'
        };
      }

      // Default authorized user for marketplace browsing & try-on sessions
      return {
        id: `cust_${Date.now()}`,
        name: credentials.email.split('@')[0],
        email: credentials.email,
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: 'CUSTOMER'
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
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'CUSTOMER';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'vton-marketplace-fallback-secret-key-32chars'
};
