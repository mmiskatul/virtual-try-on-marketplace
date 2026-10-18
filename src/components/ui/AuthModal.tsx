'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerAuthSchema, CustomerAuthFormValues } from '../../lib/schemas';
import { Input } from './input';
import { Button } from './button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CustomerAuthFormValues>({
    resolver: zodResolver(customerAuthSchema),
    defaultValues: {
      email: 'sarah.miller@example.com',
      password: 'password123'
    }
  });

  if (!isOpen) return null;

  const onCredentialsSubmit = async (data: CustomerAuthFormValues) => {
    setErrorMsg(null);
    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password
    });

    if (result?.error) {
      setErrorMsg('Invalid credentials provided.');
    } else {
      onClose();
    }
  };

  const handleDemoLogin = async () => {
    await signIn('credentials', {
      redirect: false,
      email: 'sarah.miller@example.com',
      password: 'password123'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-5 bg-slate-900/95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-white">Customer Account Sign In</h3>
            <p className="text-[11px] text-slate-400">Powered by NextAuth.js & Social OAuth</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>

        {/* Social Logins */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => signIn('google')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
              <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.3 0 10.1 0 12s.6 3.7 1.6 5.6l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 15.9C3.5 19.7 7.4 23 12 23z" />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => signIn('github')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Continue with GitHub
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase font-mono">or email credentials</span>
          <div className="border-t border-slate-800 w-full" />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit(onCredentialsSubmit)} className="space-y-3 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-slate-400 mb-1">Email Address *</label>
            <Input
              type="email"
              {...register('email')}
              className={errors.email ? 'border-rose-500' : ''}
            />
            {errors.email && (
              <p className="text-rose-400 text-[11px] mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Password *</label>
            <Input
              type="password"
              {...register('password')}
              className={errors.password ? 'border-rose-500' : ''}
            />
            {errors.password && (
              <p className="text-rose-400 text-[11px] mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold"
          >
            Sign In with Email
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleDemoLogin}
            className="w-full border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Instant Demo Customer Login
          </Button>
        </form>
      </div>
    </div>
  );
}
