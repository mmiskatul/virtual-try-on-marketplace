'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { signIn, getProviders, getSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, MailCheck, Loader2, ArrowRight } from 'lucide-react';
import { customerAuthSchema, CustomerAuthFormValues } from '../../lib/schemas';
import { marketplaceApi, DevEmailPreview } from '../../lib/api';
import { DevEmailPreviewCard } from '../auth/DevEmailPreviewCard';
import { Input } from './input';
import { Button } from './button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [devPreview, setDevPreview] = useState<DevEmailPreview | null>(null);
  const [oauthProviders, setOauthProviders] = useState<{ google: boolean; github: boolean }>({
    google: false,
    github: false,
  });

  useEffect(() => {
    if (!isOpen) return;
    getProviders()
      .then((providers) => {
        if (providers) {
          setOauthProviders({
            google: Boolean(providers.google),
            github: Boolean(providers.github),
          });
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<CustomerAuthFormValues>({
    resolver: zodResolver(customerAuthSchema),
    defaultValues: { email: '', password: '' }
  });

  if (!isOpen) return null;

  const signInWithCredentials = async (email: string, password: string) => {
    setErrorMsg(null);
    setUnverifiedEmail(null);
    setResendMessage(null);
    setDevPreview(null);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password
    });

    if (result?.error) {
      if (result.error === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(email);
        setErrorMsg('Please verify your email address before signing in.');
      } else if (result.error === 'SERVICE_UNAVAILABLE') {
        setErrorMsg('Backend auth service is unreachable (port 4000).');
      } else {
        setErrorMsg(result.error === 'CredentialsSignin' ? 'Invalid email or password.' : result.error);
      }
      return;
    }

    const updatedSession = await getSession();
    if (updatedSession?.backendToken && typeof window !== 'undefined') {
      localStorage.setItem('marketplace_token', updatedSession.backendToken);
    }
    onClose();
  };

  const onCredentialsSubmit = async (data: CustomerAuthFormValues) => {
    await signInWithCredentials(data.email, data.password);
  };

  const handleResend = async () => {
    const email = unverifiedEmail || getValues('email');
    if (!email) return;
    setResendLoading(true);
    setResendMessage(null);
    try {
      const res = await marketplaceApi.auth.resendVerification(email);
      setResendMessage(res.message);
      if (res.devPreview) setDevPreview(res.devPreview);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-gray-300 shadow-2xl space-y-5 bg-white/95 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <h3 className="font-bold text-base text-gray-900">Customer Account Sign In</h3>
            <p className="text-[11px] text-gray-500">Sign in to save AI try-on looks &amp; track orders</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">✕</button>
        </div>

        {(oauthProviders.google || oauthProviders.github) && (
          <>
            <div className="space-y-2">
              {oauthProviders.google && (
                <button
                  type="button"
                  onClick={() => signIn('google')}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors"
                >
                  Continue with Google
                </button>
              )}

              {oauthProviders.github && (
                <button
                  type="button"
                  onClick={() => signIn('github')}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors"
                >
                  Continue with GitHub
                </button>
              )}
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-[10px] text-gray-500 uppercase font-mono">or email credentials</span>
              <div className="border-t border-gray-200 w-full" />
            </div>
          </>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit(onCredentialsSubmit)} className="space-y-3 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 text-xs space-y-2">
              <p>{errorMsg}</p>
              {unverifiedEmail && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-800 font-semibold"
                  >
                    {resendLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <MailCheck className="w-3 h-3" />}
                    <span>Resend Email</span>
                  </button>
                  <Link
                    href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold"
                  >
                    <span>Verify Code</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {resendMessage && (
            <div className="p-2.5 rounded-xl bg-gray-100 border border-gray-300 text-black text-xs">
              {resendMessage}
            </div>
          )}

          <DevEmailPreviewCard preview={devPreview} actionLabel="Verify Email Now" />

          <div>
            <label className="block text-gray-500 mb-1">Email Address *</label>
            <Input
              type="email"
              {...register('email')}
              className={errors.email ? 'border-rose-500' : ''}
            />
            {errors.email && (
              <p className="text-rose-600 text-[11px] mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-gray-500">Password *</label>
              <Link
                href="/forgot-password"
                onClick={onClose}
                className="text-[11px] text-black hover:text-gray-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={`pr-9 ${errors.password ? 'border-rose-500' : ''}`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-rose-600 text-[11px] mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black hover:bg-gray-800 text-white font-bold"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In with Email'}
          </Button>

        </form>

        <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
          <span>
            New here?{' '}
            <Link href="/register" onClick={onClose} className="text-black hover:text-gray-700 font-semibold">
              Create account
            </Link>
          </span>
          <Link href="/login" onClick={onClose} className="text-gray-700 hover:text-black font-medium">
            Full login page →
          </Link>
        </div>
      </div>
    </div>
  );
}
