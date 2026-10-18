import React from 'react';
import { Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 py-16 px-6">
      <div className="max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Multi-Tenant AI Virtual Fitting Room
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white font-['Playfair_Display',serif]">
          Fashion Without Friction.<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-sky-400">
            Try It On Before You Buy.
          </span>
        </h1>

        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Discover independent designer boutiques and apparel brands. Upload your photo to see realistic fabric draping, sizing, and styling powered by deep diffusion neural networks.
        </p>
      </div>
    </section>
  );
}
