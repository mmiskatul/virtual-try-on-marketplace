'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getSession, signOut, useSession } from 'next-auth/react';
import { CheckCircle2 } from 'lucide-react';
import { AuthShell } from '../../components/auth/AuthShell';
import { CustomerEmailFlow } from '../../components/auth/CustomerEmailFlow';

function sanitizeCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/';
  }
  return raw;
}

function formatAuthError(code: string | null): string | null {
  if (!code) return null;
  switch (code) {
    case 'PortalMismatch':
      return 'This email address is already in use. Please use a different Google account or email address.';
    case 'GoogleSyncFailed':
      return 'Unable to complete Google sign-in with the backend. Please try again.';
    case 'AccessDenied':
      return 'Google sign-in was cancelled or denied.';
    case 'OAuthSignin':
    case 'OAuthCallback':
      return 'Google OAuth failed. Check GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and your redirect URI in Google Cloud Console.';
    default:
      return 'Sign-in could not be completed. Please try again.';
  }
}

function LoginFormContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const callbackUrl = sanitizeCallbackUrl(searchParams.get('callbackUrl'));
  const verifiedParam = searchParams.get('verified');
  const resetParam = searchParams.get('reset');
  const prefillEmail = searchParams.get('email') || '';
  const initialError = formatAuthError(searchParams.get('error'));

  return (
    <AuthShell
      title="Log in to V-TRY Studio"
      subtitle="Log in with Google or your email to shop and try on styles."
      badge="Customer Account"
      footer={
        <p>
          New to V-TRY Studio?{' '}
          <Link href="/register" className="text-black hover:text-gray-700 font-semibold">
            Sign up
          </Link>
        </p>
      }
    >
      {session?.user && (
        <div className="p-3.5 rounded-2xl bg-gray-100 border border-gray-300 flex items-center justify-between gap-3 text-xs">
          <div>
            <p className="text-gray-900 font-semibold">Signed in as {session.user.name || session.user.email}</p>
            <p className="text-gray-500 text-[11px]">{session.user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={callbackUrl}
              className="px-3 py-1.5 rounded-lg bg-black hover:bg-gray-800 text-white font-semibold"
            >
              Continue
            </Link>
            <button
              type="button"
              onClick={async () => {
                const { logoutMarketplace } = await import('@/lib/logout');
                await logoutMarketplace({ redirect: false });
                await getSession();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Switch
            </button>
          </div>
        </div>
      )}

      {verifiedParam === '1' && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Email verified successfully! Continue below to enter the marketplace.</span>
        </div>
      )}

      {resetParam === '1' && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Password updated successfully! Enter your email to sign in.</span>
        </div>
      )}

      <CustomerEmailFlow
        initialMode="login"
        callbackUrl={callbackUrl}
        initialEmail={prefillEmail}
        initialError={initialError}
      />
    </AuthShell>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginFormContent />
    </Suspense>
  );
}
