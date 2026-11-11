'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface AuthShellProps {
  title: string;
  subtitle: string;
  badge?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, subtitle, badge = 'Customer Portal', children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-white text-gray-900 relative overflow-hidden flex flex-col justify-center py-10 px-4">
      {/* Subtle Ambient Fashion Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gray-100 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-gray-100 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto space-y-6">
        {/* Top Brand Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-black via-black to-black flex items-center justify-center font-black text-white text-base shadow-lg shadow-black/10">
              V
            </div>
            <div>
              <span className="font-extrabold tracking-widest text-base font-['Playfair_Display',serif] text-gray-900 block leading-none">
                V-TRY <span className="text-[11px] text-black font-sans tracking-normal font-bold">STUDIO</span>
              </span>
              <span className="text-[10px] text-gray-500">AI Virtual Fitting Marketplace</span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Store</span>
          </Link>
        </div>

        {/* Main Glass Panel */}
        <div className="fashion-glass rounded-3xl p-7 shadow-2xl border border-gray-200 space-y-5">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-black border border-gray-300">
              <Sparkles className="w-3 h-3" />
              {badge}
            </span>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight pt-1">{title}</h1>
            <p className="text-xs text-gray-500 leading-relaxed">{subtitle}</p>
          </div>

          {children}
        </div>

        {footer && <div className="text-center text-xs text-gray-500">{footer}</div>}
      </div>
    </div>
  );
}

