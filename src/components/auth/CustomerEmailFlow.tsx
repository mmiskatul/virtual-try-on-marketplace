'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, getProviders, getSession } from 'next-auth/react';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { marketplaceApi } from '../../lib/api';
import { PasswordField } from './PasswordField';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export type AuthFlowMode = 'login' | 'signup';

interface CustomerEmailFlowProps {
  initialMode?: AuthFlowMode;
  onModeChange?: (mode: AuthFlowMode) => void;
  callbackUrl?: string;
  initialEmail?: string;
  initialError?: string | null;
  onAuthenticated?: () => void;
  onNavigate?: () => void;
}

export function CustomerEmailFlow({
  initialMode = 'login',
  onModeChange,
  callbackUrl = '/',
  initialEmail = '',
  initialError = null,
  onAuthenticated,
  onNavigate,
}: CustomerEmailFlowProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthFlowMode>(initialMode);
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError);
  const [suggestLoginSwitch, setSuggestLoginSwitch] = useState(false);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);
  const [googleConfigured, setGoogleConfigured] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setSuggestLoginSwitch(false);
  }, [initialMode]);

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

  const switchMode = (nextMode: AuthFlowMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setErrorMsg(null);
    setSuggestLoginSwitch(false);
    setGoogleNotice(null);
    setPassword('');
    setConfirmPassword('');
    onModeChange?.(nextMode);
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setEmail(cleanEmail);
    setLoading(true);
    setErrorMsg(null);
    setGoogleNotice(null);

    try {
      // Authenticate directly with backend first so browser stores HttpOnly access/refresh/sid cookies
      await marketplaceApi.auth.login({
        email: cleanEmail,
        password,
      });
    } catch (err: any) {
      if (err?.data?.code === 'EMAIL_NOT_VERIFIED') {
        let deliveryWarning = '';
        try {
          await marketplaceApi.auth.resendVerification(cleanEmail);
        } catch (resendErr: any) {
          if (resendErr?.message) {
            deliveryWarning = `&warning=${encodeURIComponent(resendErr.message)}`;
          }
        }
        setLoading(false);
        onNavigate?.();
        router.push(
          `/verify-email?email=${encodeURIComponent(cleanEmail)}&callbackUrl=${encodeURIComponent(callbackUrl)}${deliveryWarning}`
        );
        return;
      }

      setLoading(false);
      setErrorMsg(err?.message || 'Invalid email or password.');
      return;
    }

    const result = await signIn('credentials', {
      redirect: false,
      email: cleanEmail,
      password,
    });

    if (result?.error) {
      setLoading(false);
      setErrorMsg(
        result.error === 'CredentialsSignin'
          ? 'Could not establish local session. Please try again.'
          : result.error
      );
      return;
    }

    await getSession();
    setLoading(false);
    if (onAuthenticated) {
      onAuthenticated();
    } else {
      router.push(callbackUrl);
    }
    router.refresh();
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuggestLoginSwitch(false);
    setGoogleNotice(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
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

    setEmail(cleanEmail);
    setLoading(true);
    try {
      const check = await marketplaceApi.auth.checkEmail(cleanEmail);
      if (check.portalMismatch) {
        setErrorMsg('This email address is already in use. Please use a different email address.');
        return;
      }

      if (check.exists) {
        if (check.emailVerified) {
          setErrorMsg('An account with this email address already exists. Please log in instead.');
          setSuggestLoginSwitch(true);
          return;
        }
        await marketplaceApi.auth.resendVerification(cleanEmail);
        onNavigate?.();
        router.push(
          `/verify-email?email=${encodeURIComponent(cleanEmail)}&from=register&callbackUrl=${encodeURIComponent(callbackUrl)}`
        );
        return;
      }

      const res = await marketplaceApi.auth.register({
        name: cleanName,
        email: cleanEmail,
        password,
      });
      onNavigate?.();
      const warningParam = res.warning
        ? `&warning=${encodeURIComponent(res.warning)}`
        : '';
      router.push(
        `/verify-email?email=${encodeURIComponent(res.user.email)}&from=register&callbackUrl=${encodeURIComponent(callbackUrl)}${warningParam}`
      );
    } catch (err: any) {
      if (err?.status === 409) {
        setErrorMsg('An account with this email address already exists. Please log in instead.');
        setSuggestLoginSwitch(true);
      } else {
        setErrorMsg(err?.message || 'Could not create your account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const pwHasLen = password.length >= 8;
  const pwHasLetter = /[A-Za-z]/.test(password);
  const pwHasNumber = /[0-9]/.test(password);
  const pwMatches = Boolean(confirmPassword) && password === confirmPassword;

  return (
    <div className="space-y-4">
      {/* Clear Log In / Sign Up Mode Switcher */}
      <div
        role="tablist"
        aria-label="Account authentication mode"
        className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-stone-100 border border-stone-200"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          onClick={() => switchMode('login')}
          className={`h-9 rounded-lg text-xs font-bold transition-all ${
            mode === 'login'
              ? 'bg-white text-stone-950 shadow-sm border border-stone-200/80'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          Log In
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signup'}
          onClick={() => switchMode('signup')}
          className={`h-9 rounded-lg text-xs font-bold transition-all ${
            mode === 'signup'
              ? 'bg-white text-stone-950 shadow-sm border border-stone-200/80'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Google OAuth */}
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
            <span>{mode === 'login' ? 'Log in with Google' : 'Sign up with Google'}</span>
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
          {mode === 'login' ? 'or log in with email' : 'or sign up with email'}
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <p>{errorMsg}</p>
            {suggestLoginSwitch && mode === 'signup' && (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-bold text-stone-900 underline underline-offset-2 hover:text-black"
              >
                Log in with {email} →
              </button>
            )}
          </div>
        </div>
      )}

      {mode === 'login' ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">Email Address</label>
            <Input
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <PasswordField
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightSlot={
              <Link
                href={email.trim() ? `/forgot-password?email=${encodeURIComponent(email.trim())}` : '/forgot-password'}
                onClick={onNavigate}
                className="text-[11px] text-black hover:text-gray-700 font-semibold"
              >
                Forgot password?
              </Link>
            }
          />

          <Button type="submit" disabled={loading} className="w-full h-11 font-bold gap-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSignupSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">Full Name</label>
            <Input
              type="text"
              placeholder="Your full name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">Email Address</label>
            <Input
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <PasswordField
            label="Password"
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

          <Button type="submit" disabled={loading} className="w-full h-11 font-bold gap-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
