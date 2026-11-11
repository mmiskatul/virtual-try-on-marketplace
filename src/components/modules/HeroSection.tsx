import React from 'react';
import { Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-b from-white via-gray-100 to-white py-16 px-6">
      <div className="max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 text-black border border-gray-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-black" /> Multi-Tenant AI Virtual Fitting Room
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 font-['Playfair_Display',serif]">
          Fashion Without Friction.<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-black via-black to-black">
            Try It On Before You Buy.
          </span>
        </h1>

        <p className="text-sm md:text-base text-gray-700 max-w-2xl mx-auto leading-relaxed">
          Discover independent designer boutiques and apparel brands. Upload your photo to see realistic fabric draping, sizing, and styling powered by deep diffusion neural networks.
        </p>
      </div>
    </section>
  );
}
