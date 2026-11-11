'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Loader2, Mail, ArrowRight } from 'lucide-react';
import { customerRegisterSchema, CustomerRegisterFormValues } from '../../lib/schemas';
import { marketplaceApi, DevEmailPreview } from '../../lib/api';
import { AuthShell } from '../../components/auth/AuthShell';
import { PasswordField } from '../../components/auth/PasswordField';
import { DevEmailPreviewCard } from '../../components/auth/DevEmailPreviewCard';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

function RegisterFormContent() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [devPreview, setDevPreview] = useState<DevEmailPreview | null>(null);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomerRegisterFormValues>({
    resolver: zodResolver(customerRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordVal = watch('password') || '';

  const onSubmit = async (data: CustomerRegisterFormValues) => {
    setErrorMsg(null);
    try {
      const res = await marketplaceApi.auth.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setRegisteredEmail(res.user.email);
      setDevPreview(res.devPreview || null);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create account. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    setResending(true);
    setResendStatus(null);
    try {
      const res = await marketplaceApi.auth.resendVerification(registeredEmail);
      setResendStatus(res.message);
      if (res.devPreview) {
        setDevPreview(res.devPreview);
      }
    } catch (err: any) {
      setResendStatus(err?.message || 'Unable to resend verification email right now.');
    } finally {
      setResending(false);
    }
  };

  if (registeredEmail) {
    return (
      <AuthShell
        title="Verify your email address"
        subtitle="One quick step before your account is activated."
        badge="Check Your Inbox"
        footer={
          <p>
            Already verified?{' '}
            <Link href="/login" className="text-black hover:text-gray-700 font-semibold">
              Sign in here
            </Link>
          </p>
        }
      >
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Account created! Verification email sent</span>
          </div>
          <p className="text-gray-700 leading-relaxed">
            We sent a verification link and a 6-digit code to{' '}
            <span className="font-semibold text-gray-900">{registeredEmail}</span>.
          </p>
        </div>

        <DevEmailPreviewCard preview={devPreview} actionLabel="Click to Verify Email" />

        {resendStatus && (
          <div className="p-3 rounded-xl bg-gray-100 border border-gray-300 text-black text-xs">
            {resendStatus}
          </div>
        )}

        <div className="space-y-2.5">
          <Link
            href={`/verify-email?email=${encodeURIComponent(registeredEmail)}`}
            className="w-full h-10 px-4 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-lg shadow-black/10 transition-all"
          >
            <span>Enter 6-Digit Verification Code</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Button
            type="button"
            variant="outline"
            onClick={handleResend}
            disabled={resending}
            className="w-full gap-2"
          >
            {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            <span>Resend Verification Email</span>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your customer account"
      subtitle="Join V-TRY Studio to save virtual try-ons, curate wishlists, and track orders."
      badge="Customer Registration"
      footer={
        <p>
          Already have an account?{' '}
          <Link href="/login" className="text-black hover:text-gray-700 font-semibold">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            placeholder="Maya Lin"
            autoComplete="name"
            {...register('name')}
            className={errors.name ? 'border-rose-500 focus-visible:border-rose-500' : ''}
          />
          {errors.name && <p className="text-rose-600 text-[11px] font-medium">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">Email Address</label>
          <Input
            type="email"
            placeholder="maya@example.com"
            autoComplete="email"
            {...register('email')}
            className={errors.email ? 'border-rose-500 focus-visible:border-rose-500' : ''}
          />
          {errors.email && <p className="text-rose-600 text-[11px] font-medium">{errors.email.message}</p>}
        </div>

        <PasswordField
          label="Password"
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          showStrength
          watchedValue={passwordVal}
          error={errors.password?.message}
          {...register('password')}
        />

        <PasswordField
          label="Confirm Password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full font-bold">
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Account...
            </span>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function CustomerRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <RegisterFormContent />
    </Suspense>
  );
}

