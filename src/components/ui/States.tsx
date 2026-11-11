'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import Link from 'next/link';
import { AlertCircle, PackageOpen, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from './button';

const FALLBACK_FASHION_IMAGE =
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80';

export function SafeImage({
  src,
  alt,
  fallbackSrc = FALLBACK_FASHION_IMAGE,
  ...rest
}: ImageProps & { fallbackSrc?: string }) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  return (
    <Image
      {...rest}
      src={imgSrc || fallbackSrc}
      alt={alt || 'Fashion garment'}
      onError={() => {
        if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
      }}
    />
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
          <div className="aspect-[3/4] bg-stone-100" />
          <div className="p-4 space-y-2.5">
            <div className="h-3 w-20 bg-stone-100 rounded" />
            <div className="h-4 w-4/5 bg-stone-100 rounded" />
            <div className="h-3.5 w-1/3 bg-stone-100 rounded" />
            <div className="flex gap-2 pt-2">
              <div className="h-8 flex-1 bg-stone-100 rounded-xl" />
              <div className="h-8 w-10 bg-stone-100 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-10 md:p-14 text-center max-w-xl mx-auto my-8 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center mx-auto">
        {icon || <PackageOpen className="w-6 h-6" />}
      </div>
      <div className="space-y-1.5">
        <h3 className="font-serif text-xl font-bold text-stone-900">{title}</h3>
        <p className="text-sm text-stone-500 leading-relaxed">{description}</p>
      </div>
      {actionLabel && (
        <div className="pt-2">
          {actionHref ? (
            <Link href={actionHref}>
              <Button>{actionLabel}</Button>
            </Link>
          ) : (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
        </div>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Unable to load catalog data',
  description = 'We encountered a temporary connection issue. Your cart and saved items remain intact.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-8 text-center max-w-lg mx-auto my-8 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-stone-900">{title}</h3>
        <p className="text-xs text-stone-600 leading-relaxed">{description}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Request
        </Button>
      )}
    </div>
  );
}

export function EditorialSectionHeader({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionHref,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div className="space-y-1.5 max-w-2xl">
        {eyebrow && (
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">
            <Sparkles className="w-3 h-3 text-stone-800" />
            {eyebrow}
          </p>
        )}
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          {title}
        </h2>
        {subtitle && <p className="text-sm text-stone-600 leading-relaxed">{subtitle}</p>}
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-900 pb-0.5 hover:text-stone-600 hover:border-stone-600 transition-colors self-start sm:self-auto"
        >
          {actionLabel} →
        </Link>
      )}
    </div>
  );
}

