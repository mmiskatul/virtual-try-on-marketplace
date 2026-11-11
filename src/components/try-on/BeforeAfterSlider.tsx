'use client';

import React, { useState } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { SafeImage } from '../ui/States';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Your Photo',
  afterLabel = 'Try-On Look',
  className = '',
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(55);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 select-none">
        {/* After (Full background) */}
        <SafeImage src={afterUrl} alt={afterLabel} fill className="object-cover" />

        {/* Before (Clipped overlay using clipPath) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <SafeImage src={beforeUrl} alt={beforeLabel} fill className="object-cover" />
        </div>

        {/* Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.45)] pointer-events-none"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-stone-950 shadow-lg border border-stone-200 flex items-center justify-center">
            <MoveHorizontal className="w-4 h-4" />
          </div>
        </div>

        {/* Labels */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 text-white text-[10px] font-bold backdrop-blur-sm pointer-events-none">
          {beforeLabel}
        </span>
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-stone-950 text-[10px] font-bold backdrop-blur-sm pointer-events-none">
          {afterLabel}
        </span>
      </div>

      {/* Accessible Slider Input */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-[11px] font-semibold text-stone-500 whitespace-nowrap">{beforeLabel}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          aria-label="Compare original photo and virtual try-on result"
          className="w-full accent-stone-950 cursor-pointer"
        />
        <span className="text-[11px] font-semibold text-stone-900 whitespace-nowrap">{afterLabel}</span>
      </div>
    </div>
  );
}

