'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Sparkles, Search, ShoppingBag, User, LogOut, UserPlus } from 'lucide-react';
import { CustomerUser } from '../../types';
import { AuthModal } from '../ui/AuthModal';

interface NavbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  customer: CustomerUser | null;
  cartCount: number;
  onOpenCart: () => void;
}

export function Navbar({ search, onSearchChange, cartCount, onOpenCart }: NavbarProps) {
  const { data: session } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (session?.backendToken) {
      localStorage.setItem('marketplace_token', session.backendToken);
    }
  }, [session?.backendToken]);

  return (
    <>
      {/* Top Marketplace Bar */}
      <div className="bg-gradient-to-r from-black via-white to-black border-b border-gray-300 py-2 px-6 text-center text-xs font-semibold text-black flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-black" />
        <span>Experience High-Fidelity AI Virtual Try-On across luxury fashion brands</span>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 fashion-glass border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-black via-black to-black flex items-center justify-center font-black text-white text-base shadow-lg shadow-black/10">
              V
            </div>
            <span className="font-extrabold tracking-widest text-lg font-['Playfair_Display',serif] text-gray-900">
              V-TRY <span className="text-xs text-black font-sans tracking-normal font-bold">STUDIO</span>
            </span>
          </Link>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-lg hidden md:block">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search designer apparel, silks, blazers, and dresses..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/80 border border-gray-200 rounded-full text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Action Links, Auth & Cart */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            {session?.user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-800">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={16}
                      height={16}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-3.5 h-3.5 text-black" />
                  )}
                  <span className="font-medium text-gray-900">{session.user.name?.split(' ')[0] || 'Member'}</span>
                </div>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') localStorage.removeItem('marketplace_token');
                    signOut({ callbackUrl: '/' });
                  }}
                  title="Sign Out"
                  className="p-1.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-rose-600 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/register"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 font-semibold transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-black" />
                  <span>Register</span>
                </Link>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black hover:bg-gray-800 text-white font-bold transition-all shadow-md shadow-black/10"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}

            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-black hover:border-gray-300 transition-colors"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black text-[10px] font-bold text-white flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
