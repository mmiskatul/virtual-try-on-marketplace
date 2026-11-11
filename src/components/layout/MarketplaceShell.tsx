'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';
import { TryOnStudioModal } from '../try-on/TryOnStudioModal';
import { useCartStore } from '../../stores/useCartStore';
import { useTryOnStore } from '../../stores/useTryOnStore';

export function MarketplaceShell({
  children,
  search,
  onSearchChange,
}: {
  children: React.ReactNode;
  search?: string;
  onSearchChange?: (val: string) => void;
}) {
  const addToCart = useCartStore((s) => s.addToCart);
  const activeProduct = useTryOnStore((s) => s.activeProduct);
  const phase = useTryOnStore((s) => s.phase);
  const resultImg = useTryOnStore((s) => s.resultImageUrl);
  const userPhoto = useTryOnStore((s) => s.userUploadedPhoto);
  const setTryOnPhase = useTryOnStore((s) => s.setTryOnPhase);
  const closeTryOn = useTryOnStore((s) => s.closeTryOn);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-stone-900">
      <Navbar search={search} onSearchChange={onSearchChange} />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      <CartDrawer />
      <TryOnStudioModal
        product={activeProduct}
        phase={phase}
        resultImg={resultImg}
        userPhoto={userPhoto}
        onClose={closeTryOn}
        onResetPhase={() => setTryOnPhase('upload')}
        onAddToCart={addToCart}
      />
    </div>
  );
}

