'use client';

import React, { useState } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { RealImage } from './RealImage';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

/**
 * Compares the shopper's photo with the generated picture. The box takes the generated picture's own proportions
 * (so nothing is cropped to a fixed size) and never shows a stand-in image.
 */
export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Your Photo',
  afterLabel = 'Try-On Look',
  className = '',
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(55);
  const [ratio, setRatio] = useState<number | null>(null);

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className="relative mx-auto w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 select-none"
        // Until the picture has loaded we hold a portrait space; after that the box matches the picture exactly.
        style={{ aspectRatio: ratio ? String(ratio) : '3 / 4', maxHeight: '78vh' }}
      >
        {/* After (full background) */}
        <RealImage
          src={afterUrl}
          alt={afterLabel}
          className="absolute inset-0 h-full w-full object-contain"
          onSize={(w, h) => h > 0 && setRatio(w / h)}
        />

        {/* Before (clipped overlay) */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <RealImage src={beforeUrl} alt={beforeLabel} className="h-full w-full object-cover" />
        </div>

        {/* Divider line */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.45)]"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-950 shadow-lg">
            <MoveHorizontal className="h-4 w-4" />
          </div>
        </div>

        {/* Labels */}
        <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
          {beforeLabel}
        </span>
        <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-stone-950 backdrop-blur-sm">
          {afterLabel}
        </span>
      </div>

      {/* Accessible slider input */}
      <div className="flex items-center gap-3 px-1">
        <span className="whitespace-nowrap text-[11px] font-semibold text-stone-500">{beforeLabel}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          aria-label="Compare original photo and virtual try-on result"
          className="w-full cursor-pointer accent-stone-950"
        />
        <span className="whitespace-nowrap text-[11px] font-semibold text-stone-900">{afterLabel}</span>
      </div>
    </div>
  );
}
