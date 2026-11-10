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
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-b border-purple-500/20 py-2 px-6 text-center text-xs font-semibold text-purple-200 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        <span>Experience High-Fidelity AI Virtual Try-On across luxury fashion brands</span>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 fashion-glass border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-purple-500/25">
              V
            </div>
            <span className="font-extrabold tracking-widest text-lg font-['Playfair_Display',serif] text-white">
              V-TRY <span className="text-xs text-purple-400 font-sans tracking-normal font-bold">STUDIO</span>
            </span>
          </Link>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-lg hidden md:block">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search designer apparel, silks, blazers, and dresses..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-full text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Action Links, Auth & Cart */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            {session?.user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-200">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={16}
                      height={16}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-3.5 h-3.5 text-purple-400" />
                  )}
                  <span className="font-medium text-white">{session.user.name?.split(' ')[0] || 'Member'}</span>
                </div>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') localStorage.removeItem('marketplace_token');
                    signOut({ callbackUrl: '/' });
                  }}
                  title="Sign Out"
                  className="p-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/register"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-purple-400" />
                  <span>Register</span>
                </Link>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md shadow-purple-600/20"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}

            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-purple-500/50 transition-colors"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 text-[10px] font-bold text-white flex items-center justify-center">
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
