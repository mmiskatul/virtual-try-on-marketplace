'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, getProviders, getSession } from 'next-auth/react';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { marketplaceApi } from '../../lib/api';
import { PasswordField } from './PasswordField';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export type AuthFlowStep = 'choose_method' | 'create_password' | 'sign_in';

interface CustomerEmailFlowProps {
  callbackUrl?: string;
  initialEmail?: string;
  initialError?: string | null;
  onAuthenticated?: () => void;
  onNavigate?: () => void;
}

export function CustomerEmailFlow({
  callbackUrl = '/',
  initialEmail = '',
  initialError = null,
  onAuthenticated,
  onNavigate,
}: CustomerEmailFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<AuthFlowStep>('choose_method');
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);
  const [googleConfigured, setGoogleConfigured] = useState(false);

  useEffect(() => {
    setErrorMsg(initialError || null);
  }, [initialError]);

  useEffect(() => {
    getProviders()
      .then((providers) => {
        setGoogleConfigured(Boolean(providers?.google));
      })
      .catch(() => {});
  }, []);

  const persistPendingVerifyPreview = (targetEmail: string, devPreview?: any) => {
    if (typeof window === 'undefined' || !devPreview) return;
    try {
      sessionStorage.setItem(
        `vton_pending_verify_${targetEmail.toLowerCase()}`,
        JSON.stringify(devPreview)
      );
    } catch {
      // ignore storage quotas
    }
  };

  const handleGoogleContinue = async () => {
    setErrorMsg(null);
    setGoogleNotice(null);
    if (googleConfigured) {
      setGoogleLoading(true);
      try {
        await signIn('google', { callbackUrl });
      } finally {
        setGoogleLoading(false);
      }
      return;
    }
    setGoogleNotice(
      'Google Sign-In is wired and ready. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to marketplace/.env and restart the dev server to sign in with Google.'
    );
  };

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setEmail(cleanEmail);
    setLoading(true);
    setErrorMsg(null);
    setGoogleNotice(null);

    try {
      const check = await marketplaceApi.auth.checkEmail(cleanEmail);
      if (check.portalMismatch) {
        setErrorMsg('This email address is already in use. Please use a different email address.');
        return;
      }

      if (check.exists) {
        if (!check.emailVerified) {
          const resendRes = await marketplaceApi.auth.resendVerification(cleanEmail).catch(() => null);
          persistPendingVerifyPreview(cleanEmail, resendRes?.devPreview);
          onNavigate?.();
          router.push(
            `/verify-email?email=${encodeURIComponent(cleanEmail)}&callbackUrl=${encodeURIComponent(callbackUrl)}`
          );
          return;
        }
        setPassword('');
        setStep('sign_in');
      } else {
        const localHandle = cleanEmail.split('@')[0]?.replace(/[._-]+/g, ' ').trim() || '';
        const pretty = localHandle
          ? localHandle.replace(/\b\w/g, (c) => c.toUpperCase())
          : '';
        setName(pretty.length >= 2 ? pretty : '');
        setPassword('');
        setConfirmPassword('');
        setStep('create_password');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to verify email right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const displayName =
      name.trim().length >= 2
        ? name.trim()
        : (email.split('@')[0] || 'Customer').replace(/[^a-zA-Z0-9 ]/g, ' ').trim();

    if (displayName.length < 2) {
      setErrorMsg('Please enter your name (at least 2 characters).');
      return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMsg('Password must be at least 8 characters and include a letter and a number.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter carefully.');
      return;
    }

    setLoading(true);
    try {
      const res = await marketplaceApi.auth.register({
        name: displayName,
        email,
        password,
      });
      persistPendingVerifyPreview(res.user.email, res.devPreview);
      onNavigate?.();
      const warningParam = res.warning
        ? `&warning=${encodeURIComponent(res.warning)}`
        : '';
      router.push(
        `/verify-email?email=${encodeURIComponent(res.user.email)}&from=register&callbackUrl=${encodeURIComponent(callbackUrl)}${warningParam}`
      );
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExistingSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setLoading(false);
      if (result.error === 'EMAIL_NOT_VERIFIED') {
        const resendRes = await marketplaceApi.auth.resendVerification(email).catch(() => null);
        persistPendingVerifyPreview(email, resendRes?.devPreview);
        onNavigate?.();
        router.push(
          `/verify-email?email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`
        );
        return;
      }
      setErrorMsg(
        result.error === 'CredentialsSignin'
          ? 'Invalid password. Try again or click Forgot password.'
          : result.error
      );
      return;
    }

    const updatedSession = await getSession();
    if (updatedSession?.backendToken && typeof window !== 'undefined') {
      localStorage.setItem('marketplace_token', updatedSession.backendToken);
    }
    setLoading(false);
    if (onAuthenticated) {
      onAuthenticated();
    } else {
      router.push(callbackUrl);
    }
    router.refresh();
  };

  if (step === 'create_password') {
    const pwHasLen = password.length >= 8;
    const pwHasLetter = /[A-Za-z]/.test(password);
    const pwHasNumber = /[0-9]/.test(password);
    const pwMatches = Boolean(confirmPassword) && password === confirmPassword;

    return (
      <form onSubmit={handleRegisterConfirm} className="space-y-4">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <span className="font-semibold text-stone-900 truncate">{email}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setStep('choose_method');
              setErrorMsg(null);
            }}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-black shrink-0"
          >
            <ArrowLeft className="w-3 h-3" /> Change
          </button>
        </div>

        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-stone-900 shrink-0 mt-0.5" />
          <span>New account for V-TRY Marketplace. Create your password to receive your verification code.</span>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">Full Name</label>
          <Input
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>

        <PasswordField
          label="Enter Password"
          placeholder="Create a password (min. 8 characters)"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="grid grid-cols-3 gap-1.5 text-[10px] font-medium">
          <span className={`px-2 py-1 rounded-md border ${pwHasLen ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-stone-50 border-stone-200 text-stone-500'}`}>
            8+ chars
          </span>
          <span className={`px-2 py-1 rounded-md border ${pwHasLetter ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-stone-50 border-stone-200 text-stone-500'}`}>
            1 letter
          </span>
          <span className={`px-2 py-1 rounded-md border ${pwHasNumber ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-stone-50 border-stone-200 text-stone-500'}`}>
            1 number
          </span>
        </div>

        <PasswordField
          label="Confirm Password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmPassword && !pwMatches ? 'Passwords do not match' : undefined}
        />

        <Button type="submit" disabled={loading} className="w-full font-bold gap-2">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending Verification Code...</span>
            </>
          ) : (
            <>
              <span>Confirm</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    );
  }

  if (step === 'sign_in') {
    return (
      <form onSubmit={handleExistingSignIn} className="space-y-4">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-stone-900 truncate">{email}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setStep('choose_method');
              setErrorMsg(null);
            }}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-black shrink-0"
          >
            <ArrowLeft className="w-3 h-3" /> Change
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <PasswordField
          label="Enter Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          rightSlot={
            <Link
              href={`/forgot-password?email=${encodeURIComponent(email)}`}
              onClick={onNavigate}
              className="text-[11px] text-black hover:text-gray-700 font-semibold"
            >
              Forgot password?
            </Link>
          }
        />

        <Button type="submit" disabled={loading} className="w-full font-bold gap-2">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      {/* Option 1: Continue with Google */}
      <button
        type="button"
        onClick={handleGoogleContinue}
        disabled={loading || googleLoading}
        className="w-full h-11 px-4 rounded-xl bg-white hover:bg-stone-50 disabled:opacity-60 border border-stone-300 text-stone-900 font-semibold text-xs flex items-center justify-center gap-2.5 shadow-sm transition-colors"
      >
        {googleLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-stone-700" />
            <span>Redirecting to Google...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.25-.96 2.31-2.04 3.02l3.3 2.56c1.92-1.77 3.03-4.38 3.03-7.48 0-.72-.06-1.41-.19-2.08H12z" />
              <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.42l-3.3-2.56c-.91.61-2.08.98-3.31.98-2.54 0-4.69-1.71-5.46-4.02H3.13v2.64C4.77 19.87 8.13 22 12 22z" />
              <path fill="#4A90E2" d="M6.54 13.98A5.99 5.99 0 0 1 6.23 12c0-.69.12-1.35.31-1.98V7.38H3.13A9.97 9.97 0 0 0 2 12c0 1.61.39 3.13 1.13 4.62l3.41-2.64z" />
              <path fill="#FBBC05" d="M12 6.01c1.47 0 2.78.51 3.82 1.5l2.86-2.86C16.95 3.04 14.7 2 12 2 8.13 2 4.77 4.13 3.13 7.38l3.41 2.64C7.31 7.72 9.46 6.01 12 6.01z" />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {googleNotice && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-[11px] leading-relaxed">
          {googleNotice}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider whitespace-nowrap shrink-0">
          or continue with email
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Option 2: Email input + Forgot Password right on Step 1 */}
      <form onSubmit={handleEmailContinue} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-gray-700">Email Address</label>
            <Link
              href={email.trim() ? `/forgot-password?email=${encodeURIComponent(email.trim())}` : '/forgot-password'}
              onClick={onNavigate}
              className="text-[11px] text-black hover:text-gray-700 font-semibold"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full h-11 font-bold gap-2">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking email...</span>
            </>
          ) : (
            <>
              <span>Continue with Email</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

