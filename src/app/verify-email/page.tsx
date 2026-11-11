'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, AlertCircle, Loader2, Mail, ShieldCheck, ArrowRight, Lock, X } from 'lucide-react';
import { verifyEmailSchema, VerifyEmailFormValues } from '../../lib/schemas';
import { marketplaceApi, DevEmailPreview } from '../../lib/api';
import { AuthShell } from '../../components/auth/AuthShell';
import { DevEmailPreviewCard } from '../../components/auth/DevEmailPreviewCard';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

function sanitizeCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/';
  }
  return raw;
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlToken = searchParams.get('token');
  const urlEmail = searchParams.get('email') || '';
  const urlWarning = searchParams.get('warning');
  const fromRegister = searchParams.get('from') === 'register';
  const isEmailLocked = Boolean(urlEmail);
  const callbackUrl = sanitizeCallbackUrl(searchParams.get('callbackUrl'));

  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified' | 'error'>(
    urlToken ? 'verifying' : urlWarning ? 'error' : 'idle'
  );
  const [message, setMessage] = useState<string | null>(urlWarning);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [devPreview, setDevPreview] = useState<DevEmailPreview | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(
    fromRegister && urlEmail && !urlWarning
      ? `Verification code sent to ${urlEmail}. Check your inbox (or spam folder) and enter the 6-digit code below.`
      : null
  );
  const attemptedAutoToken = useRef(false);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: urlEmail,
      code: '',
    },
  });

  // Load any verification preview code generated on the previous registration step
  useEffect(() => {
    if (!urlEmail || typeof window === 'undefined') return;
    try {
      const raw = sessionStorage.getItem(`vton_pending_verify_${urlEmail.toLowerCase()}`);
      if (raw) {
        const parsed = JSON.parse(raw) as DevEmailPreview;
        setDevPreview(parsed);
        if (parsed.otpCode) {
          setValue('code', parsed.otpCode);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, [urlEmail, setValue]);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 6000);
    return () => clearTimeout(t);
  }, [toastMsg]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const completeAutoSignIn = async (token?: string, emailForStorage?: string) => {
    if (typeof window !== 'undefined' && emailForStorage) {
      try {
        sessionStorage.removeItem(`vton_pending_verify_${emailForStorage.toLowerCase()}`);
      } catch {
        // ignore
      }
    }
    if (!token) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('marketplace_token', token);
    }
    await signIn('credentials', {
      redirect: false,
      verifiedToken: token,
    });
    setTimeout(() => {
      router.push(callbackUrl);
      router.refresh();
    }, 800);
  };

  useEffect(() => {
    if (!urlToken || attemptedAutoToken.current) return;
    attemptedAutoToken.current = true;
    setStatus('verifying');

    marketplaceApi.auth
      .verifyEmail({ token: urlToken })
      .then(async (res) => {
        setStatus('verified');
        setMessage(res.message);
        await completeAutoSignIn(res.token, res.user?.email || urlEmail);
      })
      .catch((err: any) => {
        setStatus('error');
        setMessage(err?.message || 'Verification link is invalid or has expired.');
      });
  }, [urlToken]);

  const onSubmitCode = async (data: VerifyEmailFormValues) => {
    setMessage(null);
    const targetEmail = isEmailLocked ? urlEmail : data.email;
    try {
      const res = await marketplaceApi.auth.verifyEmail({
        email: targetEmail,
        code: data.code,
      });
      setStatus('verified');
      setMessage(res.message);
      await completeAutoSignIn(res.token, targetEmail);
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Invalid or expired verification code.');
    }
  };

  const handleResend = async () => {
    const email = getValues('email') || urlEmail;
    if (!email) {
      setStatus('error');
      setMessage('Enter your email address first so we can resend your verification code.');
      return;
    }

    setResending(true);
    setMessage(null);
    try {
      const res = await marketplaceApi.auth.resendVerification(email);
      if (res.alreadyVerified) {
        setStatus('verified');
        setMessage(res.message);
      } else if (res.warning) {
        setStatus('idle');
        setMessage(res.warning);
        setCooldown(30);
      } else {
        setStatus('idle');
        setToastMsg(res.message || `New verification code sent to ${email}.`);
        setCooldown(30);
      }
      if (res.devPreview) {
        setDevPreview(res.devPreview);
        if (res.devPreview.otpCode) {
          setValue('code', res.devPreview.otpCode);
        }
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Could not resend verification email.');
    } finally {
      setResending(false);
    }
  };

  if (status === 'verifying') {
    return (
      <AuthShell title="Verifying your email..." subtitle="Please wait while we confirm your verification link." badge="Email Verification">
        <div className="py-10 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-8 h-8 text-black animate-spin" />
          <p className="text-xs text-gray-700">Validating cryptographic verification token...</p>
        </div>
      </AuthShell>
    );
  }

  if (status === 'verified') {
    return (
      <AuthShell
        title="Welcome to V-TRY Marketplace!"
        subtitle="Your customer account is verified and signed in."
        badge="Verified Account"
      >
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-gray-900">Registration complete</p>
            <p>{message || 'Your email has been verified. Redirecting you to the marketplace...'}</p>
          </div>
        </div>

        <Link
          href={callbackUrl}
          className="w-full h-10 px-4 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-lg shadow-black/10 transition-all"
        >
          <span>Enter Marketplace</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </AuthShell>
    );
  }

  return (
    <>
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] rounded-2xl border border-emerald-200 bg-white/95 backdrop-blur-md shadow-xl p-3.5 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <Mail className="w-3.5 h-3.5" />
          </div>
          <p className="text-stone-800 leading-relaxed flex-1 pt-0.5">{toastMsg}</p>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            aria-label="Dismiss notification"
            className="text-stone-400 hover:text-stone-800 p-1 rounded-lg transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <AuthShell
        title="Enter Verification Code"
        subtitle="Enter the 6-digit verification code sent to your email to complete marketplace registration."
        badge="Step 3 • Verify Email"
        footer={
          <p>
            Wrong email?{' '}
            <Link href="/login" className="text-black hover:text-gray-700 font-semibold">
              Start over
            </Link>
          </p>
        }
      >
        {message && (
          <div
            className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
              status === 'error'
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-700'
                : 'bg-gray-100 border-gray-300 text-black'
            }`}
          >
            {status === 'error' ? <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <Mail className="w-4 h-4 shrink-0 mt-0.5" />}
            <span>{message}</span>
          </div>
        )}

      <DevEmailPreviewCard preview={devPreview} actionLabel="Verify with Direct Link" />

      <form onSubmit={handleSubmit(onSubmitCode)} className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-gray-700">Email Address</label>
            {isEmailLocked && (
              <Link href="/login" className="text-[11px] font-medium text-gray-500 hover:text-black">
                Use different email
              </Link>
            )}
          </div>
          {isEmailLocked ? (
            <>
              <input type="hidden" {...register('email')} value={urlEmail} />
              <div className="flex items-center justify-between h-10 px-3 rounded-xl border border-stone-200 bg-stone-100 text-sm text-stone-700 cursor-not-allowed select-none">
                <span className="truncate font-medium">{urlEmail}</span>
                <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-2" aria-label="Locked email" />
              </div>
            </>
          ) : (
            <>
              <Input
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className={errors.email ? 'border-rose-500 focus-visible:border-rose-500' : ''}
              />
              {errors.email && <p className="text-rose-600 text-[11px] font-medium">{errors.email.message}</p>}
            </>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">6-Digit Verification Code</label>
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="• • • • • •"
            {...register('code')}
            className={`font-mono text-center text-base tracking-[0.4em] ${
              errors.code ? 'border-rose-500 focus-visible:border-rose-500' : ''
            }`}
          />
          {errors.code && <p className="text-rose-600 text-[11px] font-medium">{errors.code.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full font-bold gap-2">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          <span>{isSubmitting ? 'Verifying & Signing In...' : 'Verify & Register for Marketplace'}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={resending || cooldown > 0}
          onClick={handleResend}
          className="w-full gap-2"
        >
          {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          <span>
            {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend Verification Code'}
          </span>
        </Button>
      </form>
      </AuthShell>
    </>
  );
}

export default function CustomerVerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
