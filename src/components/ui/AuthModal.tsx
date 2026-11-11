'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthFlowMode, CustomerEmailFlow } from '../auth/CustomerEmailFlow';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthFlowMode;
  onClose: () => void;
}

export function AuthModal({ isOpen, initialMode = 'login', onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthFlowMode>(initialMode);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-gray-300 shadow-2xl space-y-5 bg-white/95 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <h3 className="font-bold text-base text-gray-900">
              {mode === 'login' ? 'Log in to V-TRY' : 'Create your V-TRY account'}
            </h3>
            <p className="text-[11px] text-gray-500">
              {mode === 'login'
                ? 'Welcome back — log in with Google or your email'
                : 'Sign up with Google or create an account with email'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in dialog"
            className="text-gray-500 hover:text-black transition-colors"
          >
            ✕
          </button>
        </div>

        <CustomerEmailFlow
          initialMode={mode}
          onModeChange={setMode}
          onAuthenticated={onClose}
          onNavigate={onClose}
        />

        <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
          <Link href="/forgot-password" onClick={onClose} className="text-gray-700 hover:text-black font-medium">
            Forgot password?
          </Link>
          <Link
            href={mode === 'login' ? '/login' : '/register'}
            onClick={onClose}
            className="text-gray-700 hover:text-black font-medium"
          >
            Full page view →
          </Link>
        </div>
      </div>
    </div>
  );
}
